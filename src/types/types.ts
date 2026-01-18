import { FilterMatchMode } from "primereact/api";
import { DataTableFilterMeta } from "primereact/datatable";

export type ElectricityData = {
  id: bigint;
  date: string;
  startTime: string;
  productionAmount: number;
  consumptionAmount: number;
  hourlyPrice: number;
};

export type DailyTotality = {
  date: string;
  totalProduction: number;
  totalConsumption: number;
  avgPrice: number;
  longestNegativeHours: number;
};

export interface HourlyElectricityData {
  starttime: string;
  productionamount: number;
  consumptionamount: number;
  hourlyprice: number;
}

export type PaginatedResult<T> = {
  page: number;
  perPage: number;
  totalCount: number;
  data: T[];
};

export interface ElectricityTableFilters extends DataTableFilterMeta {
  global: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
  date: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
  totalProductionFormatted: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
  totalConsumptionFormatted: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
  avgPriceFormatted: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
  longestNegativeHours: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
}
