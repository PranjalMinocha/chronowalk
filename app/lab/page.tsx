import { LingbotWorld2App } from "../LingbotWorld2App";
import { SetupRequired } from "../SetupRequired";

export const dynamic = "force-dynamic";

export default function LabPage() {
  const hasKey = !!process.env.REACTOR_API_KEY;
  return hasKey ? <LingbotWorld2App /> : <SetupRequired />;
}
