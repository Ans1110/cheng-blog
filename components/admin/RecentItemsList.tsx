import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface RecentItem {
  id: string;
  title: string;
  createdAt: Date | string;
  subtitle?: string;
  badge?: {
    text: string;
    className?: string;
  };
}

interface RecentItemsListProps {
  title: string;
  description: string;
  items: RecentItem[];
  basePath: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function RecentItemsList({
  title,
  description,
  items,
  basePath,
  isLoading,
  emptyMessage = "No items yet",
}: RecentItemsListProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Link
                    href={`${basePath}/${item.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.subtitle && <span>{item.subtitle} - </span>}
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                    {item.badge && (
                      <span className={item.badge.className || "ml-2"}>
                        {item.badge.text}
                      </span>
                    )}
                  </p>
                </div>
                <Link href={`${basePath}/${item.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
