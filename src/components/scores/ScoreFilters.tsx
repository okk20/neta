import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Filter, Plus } from "lucide-react";
import { CLASSES, TERMS, YEARS } from "../../constants/scores";
import type { Subject } from "../../utils/database";

interface ScoreFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterClass: string;
  onClassChange: (value: string) => void;
  filterSubject: string;
  onSubjectChange: (value: string) => void;
  filterTerm: string;
  onTermChange: (value: string) => void;
  filterYear: string;
  onYearChange: (value: string) => void;
  subjects: Subject[];
  onAddScore: () => void;
  onClearFilters: () => void;
}

export function ScoreFilters({
  searchTerm,
  onSearchChange,
  filterClass,
  onClassChange,
  filterSubject,
  onSubjectChange,
  filterTerm,
  onTermChange,
  filterYear,
  onYearChange,
  subjects,
  onAddScore,
  onClearFilters
}: ScoreFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, subject, or grade..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="glass pl-10"
          />
        </div>
        <Button
          onClick={onAddScore}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Score
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Select value={filterTerm} onValueChange={onTermChange}>
          <SelectTrigger className="glass">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent className="glass">
            {TERMS.map(term => (
              <SelectItem key={term} value={term}>{term}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterYear} onValueChange={onYearChange}>
          <SelectTrigger className="glass">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="glass">
            {YEARS.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterClass} onValueChange={onClassChange}>
          <SelectTrigger className="glass">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="glass">
            <SelectItem value="ALL_CLASSES">All Classes</SelectItem>
            {CLASSES.map(cls => (
              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSubject} onValueChange={onSubjectChange}>
          <SelectTrigger className="glass">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent className="glass">
            <SelectItem value="ALL_SUBJECTS">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={onClearFilters}
          variant="outline"
          className="glass"
        >
          <Filter className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}