import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionList({
  title,
  items,
  empty = "Nothing found for this section.",
  asBadges = false,
}: {
  title: string;
  items: string[];
  empty?: string;
  asBadges?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{empty}</p>
        ) : asBadges ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant="rose">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
