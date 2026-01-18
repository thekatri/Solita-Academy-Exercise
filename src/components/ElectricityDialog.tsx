"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { DailyTotality, HourlyElectricityData } from "@/types/types";
import { Chart } from "primereact/chart";
import "chart.js/auto";

interface Props {
  rowData: DailyTotality | null;
  visible: boolean;
  onHide: () => void;
}

export default function ElectricityDetailDialog({
  rowData,
  visible,
  onHide,
}: Readonly<Props>) {
  const [hourlyData, setHourlyData] = useState<HourlyElectricityData[]>([]);
  const [lowestPrice, setLowestPrice] = useState<HourlyElectricityData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && rowData?.date) {
      fetchHourlyDetails(rowData.date);
    } else if (!visible) {
      setHourlyData([]);
    }
  }, [visible, rowData?.date]);

  const fetchHourlyDetails = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/electricitydata/${date}`);
      const json = await res.json();

      const data: HourlyElectricityData[] = json.data || [];

      setHourlyData(data);

      if (data.length > 0) {
        const lowest = data.reduce((min, curr) =>
          curr.hourlyprice < min.hourlyprice ? curr : min,
        );
        setLowestPrice(lowest);
      } else {
        setLowestPrice(null);
      }
    } catch (err) {
      console.error("Error fetching hourly data:", err);
      setLowestPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!hourlyData.length) return null;

    return {
      labels: hourlyData.map((item) => {
        const d = new Date(item.starttime);
        return `${d.getUTCHours().toString().padStart(2, "0")}:00`;
      }),
      datasets: [
        {
          label: "Consumption",
          data: hourlyData.map((item) => item.consumptionamount),
          yAxisID: "y",
          tension: 0.4,
        },
        {
          label: "Production",
          data: hourlyData.map((item) => item.productionamount),
          yAxisID: "y1",
          tension: 0.4,
        },
      ],
    };
  }, [hourlyData]);

  const chartOptions = {
    stacked: false,
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: "black",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "black",
        },
        grid: {
          color: "grey",
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: {
          color: "black",
        },
        grid: {
          color: "grey",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          color: "black",
        },
        grid: {
          drawOnChartArea: false,
          color: "grey",
        },
      },
    },
  };

  function dateTimeFormat(dateTime: Date | string) {
    const d = new Date(dateTime);
    console.log(dateTime);
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    console.log(hours, minutes);
    return `${hours}:${minutes}`;
  }

  const formatNumeric = (value: number) => {
    return typeof value === "number"
      ? value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        })
      : "0.00";
  };

  return (
    <Dialog
      header={`Details for ${rowData?.date || ""}`}
      visible={visible}
      onHide={onHide}
      style={{ width: "60vw" }}
      blockScroll
    >
      <div className="dialog-container">
        <div className="grid mb-4 p-3 surface-ground border-round">
          <div className="col-4">
            <p className="block text-500 font-medium mb-1">Total Production</p>
            <span className="text-900 font-bold">
              {rowData?.totalProduction?.toLocaleString()}
            </span>
          </div>
          <div className="col-4">
            <p className="block text-500 font-medium mb-1">Total Consumption</p>
            <span className="text-900 font-bold">
              {rowData?.totalConsumption?.toLocaleString()}
            </span>
          </div>
          <div className="col-4">
            <p className="block text-500 font-medium mb-1">Average Price</p>
            <span className="text-900 font-bold">
              {rowData?.avgPrice.toFixed(2)} €
            </span>
          </div>
        </div>

        <div className="grid mb-4 p-3 surface-ground border-round">
          <div className="col-4">
            <p className="block text-500 font-medium mb-1">Lowest price</p>
            <span className="text-900 font-bold">
              {lowestPrice?.hourlyprice} €
            </span>
          </div>
          <div className="col-4">
            <p className="block text-500 font-medium mb-1">Lowest price time</p>
            <span className="text-900 font-bold">
              {lowestPrice?.starttime
                ? dateTimeFormat(new Date(lowestPrice.starttime))
                : "-"}
            </span>
          </div>
          <div className="col-4">
            <p className="block text-500 font-medium mb-1">
              Lowest production amount
            </p>
            <span className="text-900 font-bold">
              {lowestPrice?.productionamount
                ? formatNumeric(lowestPrice?.productionamount)
                : 0}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner style={{ width: "40px" }} />
        </div>
      ) : (
        <DataTable
          value={hourlyData}
          scrollable
          scrollHeight="300px"
          size="small"
        >
          <Column
            field="starttime"
            header="Time"
            body={(rd) => dateTimeFormat(rd.starttime)}
          />
          <Column
            field="productionamount"
            header="Production"
            body={(rowData) => formatNumeric(rowData.productionamount)}
          />
          <Column
            field="consumptionamount"
            header="Consumption"
            body={(rowData) => formatNumeric(rowData.consumptionamount)}
          />
          <Column
            field="hourlyprice"
            header="Price (€)"
            body={(rd) => `${Number(rd.hourlyprice).toFixed(3)} €`}
          />
        </DataTable>
      )}
      <br />
      {chartData && (
        <div style={{ height: "350px" }}>
          <Chart type="line" data={chartData} options={chartOptions} />
        </div>
      )}
    </Dialog>
  );
}
