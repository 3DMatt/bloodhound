
#  Licensed to the Apache Software Foundation (ASF) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The ASF licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.

""" Multi product support for ticket queries."""

from __future__ import with_statement

from itertools import groupby
from math import ceil

from genshi.builder import tag

from trac.db import get_column_names
from trac.ticket.query import Query, TicketQueryMacro
from trac.util import Ranges, as_bool
from trac.util.datefmt import from_utimestamp
from trac.util.text import shorten_line
from trac.util.translation import _, tag_
from trac.web.chrome import Chrome, add_stylesheet

from multiproduct.dbcursor import GLOBAL_PRODUCT
from multiproduct.env import lookup_product_env, resolve_product_href

class ProductQuery(Query):
    """Product Overrides for TracQuery.
    
    This class allows for writing TracQuery expressions matching resources
    beyond product boundaries.
    """
    
    def _count(self, sql, args):
        cnt = self.env.db_direct_query("SELECT COUNT(*) FROM (%s) AS x"
                                % sql, args)[0][0]
        # "AS x" is needed for MySQL ("Subqueries in the FROM Clause")
        self.env.log.debug("Count results in Query: %d", cnt)
        return cnt

    def get_columns(self):
        super(ProductQuery, self).get_columns()
        if not 'product' in self.cols:
            # make sure 'product' is always present 
            # (needed for product context, href, permission checks ...)
            self.cols.insert(0, 'product')
        return self.cols

    def execute(self, req=None, db=None, cached_ids=None, authname=None,
                tzinfo=None, href=None, locale=None):
        """Retrieve the list of matching tickets.

        :since 1.0: the `db` parameter is no longer needed and will be removed
        in version 1.1.1
        """
        if req is not None:
            href = req.href
        with self.env.db_direct_query as db:
            cursor = db.cursor()

            self.num_items = 0
            sql, args = self.get_sql(req, cached_ids, authname, tzinfo, locale)
            self.num_items = self._count(sql, args)

            if self.num_items <= self.max:
                self.has_more_pages = False

            if self.has_more_pages:
                max = self.max
                if self.group:
                    max += 1
                sql = sql + " LIMIT %d OFFSET %d" % (max, self.offset)
                if (self.page > int(ceil(float(self.num_items) / self.max)) and
                    self.num_items != 0):
                    raise TracError(_("Page %(page)s is beyond the number of "
                                      "pages in the query", page=self.page))

            # self.env.log.debug("SQL: " + sql % tuple([repr(a) for a in args]))
            cursor.execute(sql, args)
            columns = get_column_names(cursor)
            fields = []
            for column in columns:
                fields += [f for f in self.fields if f['name'] == column] or \
                          [None]
            results = []

            column_indices = range(len(columns))
            for row in cursor:
                result = {}
                for i in column_indices:
                    name, field, val = columns[i], fields[i], row[i]
                    if name == 'reporter':
                        val = val or 'anonymous'
                    elif name == 'id':
                        val = int(val)
                        if href is not None:
                            result['href'] = href.ticket(val)
                    elif name in self.time_fields:
                        val = from_utimestamp(val)
                    elif field and field['type'] == 'checkbox':
                        try:
                            val = bool(int(val))
                        except (TypeError, ValueError):
                            val = False
                    elif val is None:
                        val = ''
                    result[name] = val
                results.append(result)
            cursor.close()
            return results

class ProductTicketQueryMacro(TicketQueryMacro):
    """TracQuery macro retrieving results across product boundaries. 
    """
    def expand_macro(self, formatter, name, content):
        req = formatter.req
        query_string, kwargs, format = self.parse_args(content)
        if query_string:
            query_string += '&'
        query_string += '&'.join('%s=%s' % item
                                 for item in kwargs.iteritems())
        query = ProductQuery.from_string(self.env, query_string)

        if format == 'count':
            cnt = query.count(req)
            return tag.span(cnt, title='%d tickets for which %s' %
                            (cnt, query_string), class_='query_count')

        tickets = query.execute(req)

        if format == 'table':
            data = query.template_data(formatter.context, tickets,
                                       req=formatter.context.req)

            add_stylesheet(req, 'common/css/report.css')

            return Chrome(self.env).render_template(
                req, 'query_results.html', data, None, fragment=True)

        if format == 'progress':
            from trac.ticket.roadmap import (RoadmapModule,
                                             apply_ticket_permissions,
                                             get_ticket_stats,
                                             grouped_stats_data)

            add_stylesheet(req, 'common/css/roadmap.css')

            def query_href(extra_args, group_value = None):
                q = Query.from_string(self.env, query_string)
                if q.group:
                    extra_args[q.group] = group_value
                    q.group = None
                for constraint in q.constraints:
                    constraint.update(extra_args)
                if not q.constraints:
                    q.constraints.append(extra_args)
                return q.get_href(formatter.context)
            chrome = Chrome(self.env)
            tickets = apply_ticket_permissions(self.env, req, tickets)
            stats_provider = RoadmapModule(self.env).stats_provider
            by = query.group
            if not by:
                stat = get_ticket_stats(stats_provider, tickets)
                data = {
                    'stats': stat,
                    'stats_href': query_href(stat.qry_args),
                    'interval_hrefs': [query_href(interval['qry_args'])
                                       for interval in stat.intervals],
                    'legend': True,
                }
                return tag.div(
                    chrome.render_template(req, 'progress_bar.html', data,
                                           None, fragment=True),
                    class_='trac-progress')

            def per_group_stats_data(gstat, group_name):
                return {
                    'stats': gstat,
                    'stats_href': query_href(gstat.qry_args,  group_name),
                    'interval_hrefs': [query_href(interval['qry_args'],
                                                  group_name)
                                       for interval in gstat.intervals],
                    'percent': '%d / %d' % (gstat.done_count,
                                            gstat.count),
                    'legend': False,
                }

            groups = grouped_stats_data(self.env, stats_provider, tickets, by,
                                        per_group_stats_data)
            data = {
                'groups': groups, 'grouped_by': by,
                'summary': _("Ticket completion status for each %(group)s",
                             group=by),
            }
            return tag.div(
                chrome.render_template(req, 'progress_bar_grouped.html', data,
                                       None, fragment=True),
                class_='trac-groupprogress')

        # Formats above had their own permission checks, here we need to
        # do it explicitly:

        tickets = [t for t in tickets
                   if 'TICKET_VIEW' in req.perm('ticket', t['id'])]

        if not tickets:
            return tag.span(_("No results"), class_='query_no_results')

        # Cache resolved href targets
        hrefcache = {}

        def ticket_anchor(ticket):
            try:
                pvalue = ticket.get('product') or GLOBAL_PRODUCT
                envhref = hrefcache[pvalue]
            except KeyError:
                try:
                    env = lookup_product_env(self.env, prefix= pvalue,
                                             name=pvalue)
                except LookupError:
                    return tag.a('#%s' % ticket['id'], 
                                 class_='missing product')
                hrefcache[pvalue] = envhref = resolve_product_href(
                         to_env=env, at_env=self.env)
            return tag.a('#%s' % ticket['id'],
                         class_=ticket['status'],
                         href=envhref.ticket(int(ticket['id'])),
                         title=shorten_line(ticket['summary']))

        def ticket_groups():
            groups = []
            for v, g in groupby(tickets, lambda t: t[query.group]):
                q = Query.from_string(self.env, query_string)
                # produce the hint for the group
                q.group = q.groupdesc = None
                order = q.order
                q.order = None
                title = _("%(groupvalue)s %(groupname)s tickets matching "
                          "%(query)s", groupvalue=v, groupname=query.group,
                          query=q.to_string())
                # produce the href for the query corresponding to the group
                for constraint in q.constraints:
                    constraint[str(query.group)] = v
                q.order = order
                href = q.get_href(formatter.context)
                groups.append((v, [t for t in g], href, title))
            return groups

        if format == 'compact':
            if query.group:
                groups = [(v, ' ',
                           tag.a('#%s' % u',\u200b'.join(str(t['id'])
                                                         for t in g),
                                 href=href, class_='query', title=title))
                          for v, g, href, title in ticket_groups()]
                return tag(groups[0], [(', ', g) for g in groups[1:]])
            else:
                alist = [ticket_anchor(ticket) for ticket in tickets]
                return tag.span(alist[0], *[(', ', a) for a in alist[1:]])
        else:
            if query.group:
                return tag.div(
                    [(tag.p(tag_('%(groupvalue)s %(groupname)s tickets:',
                                 groupvalue=tag.a(v, href=href, class_='query',
                                                  title=title),
                                 groupname=query.group)),
                      tag.dl([(tag.dt(ticket_anchor(t)),
                               tag.dd(t['summary'])) for t in g],
                             class_='wiki compact'))
                     for v, g, href, title in ticket_groups()])
            else:
                return tag.div(tag.dl([(tag.dt(ticket_anchor(ticket)),
                                        tag.dd(ticket['summary']))
                                       for ticket in tickets],
                                      class_='wiki compact'))

    def is_inline(self, content):
        query_string, kwargs, format = self.parse_args(content)
        return format in ('count', 'compact')