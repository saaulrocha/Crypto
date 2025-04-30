"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FilterOption {
  value: string
  label: string
}

export interface SortOption {
  value: string
  label: string
  direction: "asc" | "desc"
}

interface FilterSortBarProps {
  onSortChange: (option: SortOption) => void
  onFilterChange: (option: FilterOption) => void
  onSearchChange: (query: string) => void
  searchQuery: string
  selectedSort: SortOption
  selectedFilter: FilterOption
}

const sortOptions: SortOption[] = [
  { value: "market_cap_desc", label: "Cap. de mercado (Mayor a menor)", direction: "desc" },
  { value: "market_cap_asc", label: "Cap. de mercado (Menor a mayor)", direction: "asc" },
  { value: "volume_desc", label: "Volumen (Mayor a menor)", direction: "desc" },
  { value: "volume_asc", label: "Volumen (Menor a mayor)", direction: "asc" },
  { value: "price_change_24h_desc", label: "Cambio 24h (Mayor a menor)", direction: "desc" },
  { value: "price_change_24h_asc", label: "Cambio 24h (Menor a mayor)", direction: "asc" },
]

const filterOptions: FilterOption[] = [
  { value: "all", label: "Todas las monedas" },
  { value: "top_100", label: "Top 100" },
  { value: "gainers", label: "Ganadoras" },
  { value: "losers", label: "Perdedoras" },
]

export function FilterSortBar({
  onSortChange,
  onFilterChange,
  onSearchChange,
  searchQuery,
  selectedSort,
  selectedFilter,
}: FilterSortBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar monedas..."
          className="pl-8 rounded-full w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Select
          value={selectedFilter.value}
          onValueChange={(value) => {
            const option = filterOptions.find((opt) => opt.value === value)
            if (option) onFilterChange(option)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-full">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filtrar por</SelectLabel>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={selectedSort.value}
          onValueChange={(value) => {
            const option = sortOptions.find((opt) => opt.value === value)
            if (option) onSortChange(option)
          }}
        >
          <SelectTrigger className="w-full sm:w-[240px] rounded-full">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ordenar por</SelectLabel>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
