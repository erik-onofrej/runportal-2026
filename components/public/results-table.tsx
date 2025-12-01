'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsTableProps {
  results: Array<{
    place: number | null;
    categoryPlace: number | null;
    firstName: string;
    lastName: string;
    city?: string | null;
    club?: string | null;
    bibNumber?: string | null;
    category: string;
    finishTime: number | null;
    finishTimeFormatted: string | null;
    pace: number | null;
    paceFormatted: string | null;
    status: string;
  }>;
  categories?: Array<{ id: number; name: string }>;
  showCategoryFilter?: boolean;
}

type SortField = 'place' | 'categoryPlace' | 'name' | 'club' | 'time';
type SortOrder = 'asc' | 'desc';

export function ResultsTable({ results, categories, showCategoryFilter = true }: ResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('place');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter results
  const filteredResults = results.filter((result) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = `${result.firstName} ${result.lastName}`.toLowerCase();
      const club = (result.club || '').toLowerCase();
      const city = (result.city || '').toLowerCase();

      if (!name.includes(query) && !club.includes(query) && !city.includes(query)) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter !== 'all' && result.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && result.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'place':
        comparison = (a.place || 999999) - (b.place || 999999);
        break;
      case 'categoryPlace':
        comparison = (a.categoryPlace || 999999) - (b.categoryPlace || 999999);
        break;
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'club':
        comparison = (a.club || '').localeCompare(b.club || '');
        break;
      case 'time':
        comparison = (a.finishTime || 999999) - (b.finishTime || 999999);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finished':
        return <Badge variant="default">Finished</Badge>;
      case 'dnf':
        return <Badge variant="secondary">DNF</Badge>;
      case 'dsq':
        return <Badge variant="destructive">DSQ</Badge>;
      case 'dns':
        return <Badge variant="outline">DNS</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, club, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category filter */}
            {showCategoryFilter && categories && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="dnf">DNF</SelectItem>
                  <SelectItem value="dsq">DSQ</SelectItem>
                  <SelectItem value="dns">DNS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {sortedResults.length} of {results.length} results
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('place')}
                      className="h-8 px-2"
                    >
                      Place
                      {sortField === 'place' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('name')}
                      className="h-8 px-2"
                    >
                      Name
                      {sortField === 'name' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>Bib</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('club')}
                      className="h-8 px-2"
                    >
                      Club
                      {sortField === 'club' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('categoryPlace')}
                      className="h-8 px-2"
                    >
                      Cat. Place
                      {sortField === 'categoryPlace' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('time')}
                      className="h-8 px-2"
                    >
                      Time
                      {sortField === 'time' && <ArrowUpDown className="ml-2 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>Pace</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedResults.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold">{result.place || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {result.firstName} {result.lastName}
                      </TableCell>
                      <TableCell>{result.bibNumber || '-'}</TableCell>
                      <TableCell>{result.club || '-'}</TableCell>
                      <TableCell>{result.city || '-'}</TableCell>
                      <TableCell>{result.categoryPlace || '-'}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{result.category}</span>
                      </TableCell>
                      <TableCell className="font-mono">{result.finishTimeFormatted || '-'}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {result.paceFormatted || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(result.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
