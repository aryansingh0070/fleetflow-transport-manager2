import { FleetMap } from "../components/maps/FleetMap";
import { RouteMap } from "../components/maps/RouteMap";
import type { Trip, Vehicle } from "../types";

type MapsExplorerProps = {
  vehicles: Vehicle[];
  trips: Trip[];
};

export function MapsExplorer({ vehicles, trips }: MapsExplorerProps) {
  return (
    <div className="space-y-6">
      <FleetMap vehicles={vehicles} />
      <RouteMap trips={trips} />
    </div>
  );
}
