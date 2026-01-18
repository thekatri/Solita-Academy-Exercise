"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import ElectricityDialog from "./ElectricityDialog";
import { FilterMatchMode } from "primereact/api";
import { ElectricityTableFilters } from "@/types/types";

interface ElectricityData {
  date: string;
  totalProduction: number;
  totalConsumption: number;
  avgPrice: number;
  longestNegativeHours: number;
}

export default function ElectricityTable() {
  const [data, setData] = useState<ElectricityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<ElectricityData | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [filters, setFilters] = useState<ElectricityTableFilters>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    totalProductionFormatted: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    totalConsumptionFormatted: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    avgPriceFormatted: { value: null, matchMode: FilterMatchMode.CONTAINS },
    longestNegativeHours: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/electricitydata");
        const json = await response.json();
        setData(json.data || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      date: { value: null, matchMode: FilterMatchMode.CONTAINS },
      totalProductionFormatted: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      totalConsumptionFormatted: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      avgPriceFormatted: { value: null, matchMode: FilterMatchMode.CONTAINS },
      longestNegativeHours: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    });
    setGlobalFilterValue("");
  };

  const clearFilter = () => {
    initFilters();
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const formatNumeric = (value: number) => {
    return typeof value === "number"
      ? value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";
  };

  const handleRowClick = (row: ElectricityData) => {
    setSelectedRow(row);
    setDialogVisible(true);
  };

  // Add formatted fields to data for filtering
  const formattedData = data.map((item) => ({
    ...item,
    totalProductionFormatted: formatNumeric(item.totalProduction),
    totalConsumptionFormatted: formatNumeric(item.totalConsumption),
    avgPriceFormatted: formatNumeric(item.avgPrice),
  }));

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={clearFilter}
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div className="card p-4 shadow-1 border-round">
      <DataTable
        value={formattedData}
        paginator
        header={header}
        rows={25}
        rowsPerPageOptions={[10, 25, 50, 100]}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={[
          "date",
          "totalProduction",
          "totalConsumption",
          "avgPrice",
          "longestNegativeHours",
        ]}
        loading={loading}
        showGridlines
        stripedRows
        sortField="date"
        sortOrder={-1}
        removableSort
        onRowClick={(e) => handleRowClick(e.data as ElectricityData)}
        emptyMessage="No data found."
      >
        <Column
          field="date"
          header="Date"
          sortable
          filter
          filterPlaceholder="Search by date"
          style={{ minWidth: "12rem" }}
        />

        <Column
          field="totalProduction"
          header="Production"
          sortable
          filter
          filterField="totalProductionFormatted"
          filterPlaceholder="Search by production"
          body={(rowData) => formatNumeric(rowData.totalProduction)}
          style={{ minWidth: "12rem" }}
        />

        <Column
          field="totalConsumption"
          header="Consumption"
          sortable
          filter
          filterField="totalConsumptionFormatted"
          filterPlaceholder="Search by consumption"
          body={(rowData) => formatNumeric(rowData.totalConsumption)}
          style={{ minWidth: "12rem" }}
        />

        <Column
          field="avgPrice"
          header="Avg Price (€)"
          sortable
          filter
          filterField="avgPriceFormatted"
          filterPlaceholder="Search by price"
          body={(rowData) => formatNumeric(rowData.avgPrice)}
          style={{ minWidth: "12rem" }}
        />

        <Column
          field="longestNegativeHours"
          header="Negative hours (h)"
          sortable
          filter
          filterPlaceholder="Search by streak"
          style={{ minWidth: "10rem" }}
        />
      </DataTable>

      <ElectricityDialog
        rowData={selectedRow}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
      />
    </div>
  );
}
