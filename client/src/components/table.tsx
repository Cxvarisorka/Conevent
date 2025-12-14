import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Check, ChevronsUpDown, Calendar } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CalendarRange } from "./calendar-range";

// Generate random sample data for the table
const SAMPLE_TITLES = ["LOMI", "Atlas", "Vista", "Aurora", "Nexus"];
const SAMPLE_DESCRIPTIONS = [
  "Tbillisi event-hall",
  "Main conference room",
  "Outdoor venue",
  "Banquet hall",
  "VIP lounge",
];
const SAMPLE_STATUSES: Payment["status"][] = [
  "pending",
  "processing",
  "success",
  "finished",
];

// Company samples
const COMPANY_TITLES = [
  "Acme Corp",
  "Eventify",
  "GrandHosts",
  "VenuePro",
  "Local Co",
];
const COMPANY_LINKS = [
  "https://example.com",
  "https://eventify.example",
  "https://grandhosts.example",
  "https://venuepro.example",
  "https://localco.example",
];
const COMPANY_DESCRIPTIONS = [
  "Official organizer",
  "Venue partner",
  "Catering partner",
  "Logistics",
  "Sponsorship",
];

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function randomChoice<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear = 2023, endYear = 2026) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + Math.random() * (end - start));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateRandomPayments(count = 8): Payment[] {
  return Array.from({ length: count }).map(() => ({
    id: randomId(),
    title: randomChoice(SAMPLE_TITLES),
    description: randomChoice(SAMPLE_DESCRIPTIONS),
    date: randomDate(),
    status: randomChoice(SAMPLE_STATUSES),
    company: {
      link: randomChoice(COMPANY_LINKS),
      title: randomChoice(COMPANY_TITLES),
      description: randomChoice(COMPANY_DESCRIPTIONS),
      date: randomDate(),
    },
  }));
}

const data: Payment[] = generateRandomPayments(8);

export type Payment = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "processing" | "success" | "finished";
  company: {
    link: string;
    title: string;
    description: string;
    date: string;
  };
};

export const columns: ColumnDef<Payment>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}

  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  // ! Id section

  {
    accessorKey: "title",
    header: "title",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="pt-2 px-2 capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "status",
    enableGlobalFilter: false,
    header: "status",
    cell: ({ row }) => (
      <div className="p-2 pt-0">
        {row.getValue("status") == "pending" && (
          <Badge className="capitalize">{row.getValue("status")}</Badge>
        )}
        {row.getValue("status") == "processing" && (
          <Badge variant={"process"} className="capitalize">
            {row.getValue("status")}
          </Badge>
        )}
        {row.getValue("status") == "success" && (
          <Badge variant={"success"} className="capitalize">
            {row.getValue("status")}
          </Badge>
        )}
        {row.getValue("status") == "finished" && (
          <Badge variant={"destructive"} className="capitalize">
            {row.getValue("status")}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "description",
    enableGlobalFilter: false,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          description
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="p-2 pt-0 lowercase">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "company",
    header: "company",
    cell: ({ row }) => {
      const c = row.original.company;
      return (
        <div className="p-2 pb-0 flex flex-col bg-secondary/50 rounded-md gap-1">
          <a
            href={c.link && "#"}
            className="text-sm font-medium text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {c.title}
          </a>
          <div className="flex justify-between p-2 px-0">
            <div className="text-xs lowercase">{c.description}</div>
            <div className="text-xs text-right">{c.date}</div>
          </div>
        </div>
      );
    },
  },
];

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Company filter states
  const [companyFilter, setCompanyFilter] = React.useState("");
  const [onlyCompany, setOnlyCompany] = React.useState(false);
  const [openCompany, setOpenCompany] = React.useState(false);

  // Date range filter state
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [openDatePicker, setOpenDatePicker] = React.useState(false);

  const companySuggestions = React.useMemo(() => {
    const titles = data
      .map((d) => d.company?.title)
      .filter((t): t is string => Boolean(t));
    return Array.from(new Set(titles));
  }, [data]);

  // ! global filter
  const [globalFilter, setGlobalFilter] = React.useState("");

  const filteredData = React.useMemo(() => {
    let res = data;
    if (companyFilter.trim()) {
      const q = companyFilter.trim().toLowerCase();
      res = res.filter((p) => p.company?.title.toLowerCase().includes(q));
    }
    if (onlyCompany) {
      res = res.filter((p) => !!p.company && !!p.company.title);
    }
    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      res = res.filter((p) => {
        const itemDate = new Date(p.date);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    return res;
  }, [data, companyFilter, onlyCompany, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="w-full">
        {/* header */}
        <div className="flex items-center py-4 flex-wrap gap-2">
          <Input
            placeholder="event title..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Popover open={openCompany} onOpenChange={setOpenCompany}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCompany}
                  className="w-[220px] justify-between"
                >
                  {companyFilter
                    ? companySuggestions.find((c) => c === companyFilter) ||
                      companyFilter
                    : "Select company..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search company..."
                    value={companyFilter}
                    onValueChange={(v: string) => setCompanyFilter(v)}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup>
                      {companySuggestions.map((s) => (
                        <CommandItem
                          key={s}
                          value={s}
                          onSelect={(currentValue) => {
                            const v = currentValue as string;
                            setCompanyFilter(v === companyFilter ? "" : v);
                            setOpenCompany(false);
                          }}
                        >
                          {s}
                          <Check
                            className={cn(
                              "ml-auto",
                              companyFilter === s ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
              </Popover>
          </div>

          {/* Date Range Filter */}
          <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateRange?.from ? (
                  <>
                    {dateRange.from.toLocaleDateString()} 
                    {dateRange.to && ` - ${dateRange.to.toLocaleDateString()}`}
                  </>
                ) : (
                  "Pick dates..."
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                <CalendarRange selected={dateRange} onSelect={setDateRange} />
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* header end */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              className="grid auto-rows-min gap-4 md:grid-cols-5"
              key={headerGroup.id}
            >
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Card
                    className="flex gap-4 p-0"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    ))}
                  </Card>
                ))
              ) : (
                <div>
                  <div className="h-24 text-center">No results.</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
