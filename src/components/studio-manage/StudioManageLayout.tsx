import { Outlet } from "react-router-dom";
import { StudioDashboardLayout } from "./StudioDashboardLayout";

export function StudioManageLayout() {
  return (
    <StudioDashboardLayout>
      <Outlet />
    </StudioDashboardLayout>
  );
}
