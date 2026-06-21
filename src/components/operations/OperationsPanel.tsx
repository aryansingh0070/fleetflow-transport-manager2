import { memo } from "react";
import type { Driver, Trip, Vehicle } from "../../types";
import { DriverManager } from "./DriverManager";
import { TripManager } from "./TripManager";
import { VehicleManager } from "./VehicleManager";

type OperationsPanelProps = {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onRefresh: () => Promise<void>;
};

function OperationsPanelComponent({ trips, vehicles, drivers, onRefresh }: OperationsPanelProps) {
  return (
    <section className="space-y-6">
      <TripManager trips={trips} vehicles={vehicles} drivers={drivers} onRefresh={onRefresh} />
      <VehicleManager vehicles={vehicles} onRefresh={onRefresh} />
      <DriverManager drivers={drivers} vehicles={vehicles} onRefresh={onRefresh} />
    </section>
  );
}

export const OperationsPanel = memo(OperationsPanelComponent);
