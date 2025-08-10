import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MemeTemplate } from "@shared/schema";

interface TemplateGridProps {
  onSelectTemplate: (template: MemeTemplate) => void;
}

export function TemplateGrid({ onSelectTemplate }: TemplateGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MemeTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load meme templates
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Unable to fetch templates from the server. Please try again.
        </p>
        <Button onClick={() => refetch()} data-testid="button-retry-templates">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search meme templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-templates"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="bg-secondary hover:bg-secondary/90"
            data-testid="button-refresh-templates"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Choose Your Template
      </h3>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading awesome meme templates...
          </p>
        </div>
      ) : (
        <>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                No templates found matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                  data-testid={`template-card-${template.id}`}
                >
                  <img
                    src={template.url}
                    alt={template.name}
                    className="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.width}x{template.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
