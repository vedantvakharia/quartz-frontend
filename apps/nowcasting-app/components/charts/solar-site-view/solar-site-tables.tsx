import React from "react";
import { useEffect } from "react";
import {
  ThinUpArrow,
  ThinDownArrow,
  UpArrow,
  DownArrow,
  SitesDownArrow,
  SitesUpArrow
} from "../../icons/icons";
import {
  CombinedSitesData,
  SitesPvActual,
  SitesPvForecast,
  Site,
  AllSites,
  AggregatedSitesDatum,
  AggregatedSitesDataGroupMap
} from "../../types";
import useGlobalState from "../../helpers/globalState";
import useFormatChartDataSites from "../use-format-chart-data-sites";
import { SORT_BY } from "../../../constant";
import { Dispatch, SetStateAction } from "react";
import { convertISODateStringToLondonTime } from "../../helpers/utils";
import { ChartData } from "../remix-line";
import { formatISODateString } from "../../helpers/utils";

const TableHeader: React.FC<{ text: string }> = ({ text }) => {
  const [sortBy, setSortBy] = useGlobalState("sortBy");
  const [sortDirection, setSortDirection] = useGlobalState("sortDirection");

  const handleNameSort = () => {
    if (sortBy === SORT_BY.NAME) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(SORT_BY.NAME);
      setSortDirection("asc"); // Default alphabetical is A-Z
    }
  };

  const handleYieldSort = () => {
    if (sortBy === SORT_BY.YIELD) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(SORT_BY.YIELD);
      setSortDirection("desc");
    }
  };

  const handleGenerationSort = () => {
    if (sortBy === SORT_BY.GENERATION) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(SORT_BY.GENERATION);
      setSortDirection("desc");
    }
  };

  const isSortingByName = sortBy === SORT_BY.NAME;
  const isSortingByYield = sortBy === SORT_BY.YIELD;
  const isSortingByGeneration = sortBy === SORT_BY.GENERATION;

  // Component for combined up/down arrows
  const SortArrows: React.FC<{ isActive: boolean; direction: "asc" | "desc" }> = ({
    isActive,
    direction
  }) => (
    <span className="ml-1 flex flex-col items-center">
      <SitesUpArrow
        className={isActive && direction === "asc" ? "opacity-100" : "opacity-30"}
        size={10}
      />
      <SitesDownArrow
        className={isActive && direction === "desc" ? "opacity-100" : "opacity-30"}
        size={10}
      />
    </span>
  );

  return (
    <div
      className="z-10 flex flex-row bg-ocf-sites-100
            justify-between"
    >
      {/* Site Name Column - Sortable */}
      <div
        className="ml-10 w-80 cursor-pointer hover:text-ocf-yellow-500 transition-colors"
        onClick={handleNameSort}
        title="Click to sort by name"
      >
        <div className="py-3 font-bold text-sm flex items-center">
          <p>{text}</p>
          <SortArrows isActive={isSortingByName} direction={sortDirection} />
        </div>
      </div>

      <div className="flex flex-row">
        {/* %Yield Column Header */}
        <div
          className="text-white w-32
                         justify-start py-3 pr-10 font-bold flex flex-row items-center text-sm cursor-pointer hover:text-ocf-yellow-500 transition-colors"
          onClick={handleYieldSort}
          title="Click to sort by % yield"
        >
          <p>%Yield</p>
          <SortArrows isActive={isSortingByYield} direction={sortDirection} />
        </div>

        {/* Generation Column Header */}
        <div
          className="flex text-white font-bold w-32 justify-center py-3 pr-10 text-sm cursor-pointer hover:text-ocf-yellow-500 transition-colors items-center"
          onClick={handleGenerationSort}
          title="Click to sort by generation (KW)"
        >
          <p>KW</p>
          <SortArrows isActive={isSortingByGeneration} direction={sortDirection} />
        </div>
      </div>
    </div>
  );
};
// Tables will show Capacity => This should be the forecast as % yield if we don't have truth value in the past.
//Tables will also show generation MW value over installed capacity. If we have truths, use truths, if we have forecast, use forecast given a specific time.

/**
 * Filters sites based on search term across multiple fields
 */
const filterSitesBySearchTerm = (
  sites: AggregatedSitesDatum[],
  searchTerm: string
): AggregatedSitesDatum[] => {
  if (!searchTerm || searchTerm.trim() === "") {
    return sites;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  return sites.filter((site) => {
    // Search across all relevant fields
    const searchableFields = [
      site.label,
      site.dnoId,
      site.gspId,
      site.clientSiteId,
      site.clientSiteName,
      site.id
    ];

    return searchableFields.some((field) => field?.toLowerCase().includes(normalizedSearch));
  });
};

type TableDataProps = {
  rows: AggregatedSitesDatum[];
};

const TableData: React.FC<TableDataProps> = ({ rows }) => {
  const [sortBy, setSortBy] = useGlobalState("sortBy");
  const [sortDirection] = useGlobalState("sortDirection");
  const [clickedSiteGroupId, setClickedSiteGroupId] = useGlobalState("clickedSiteGroupId");
  const [searchTerm] = useGlobalState("sitesSearchTerm");

  const sortFn = (a: any, b: any) => {
    let result = 0;

    if (sortBy === SORT_BY.NAME) {
      result = a.label.localeCompare(b.label);
    } else if (sortBy === SORT_BY.CAPACITY) {
      result = b.capacity - a.capacity;
    } else if (sortBy === SORT_BY.GENERATION) {
      const aGen = a.actualPV || a.expectedPV;
      const bGen = b.actualPV || b.expectedPV;
      result = bGen - aGen;
    } else if (sortBy === SORT_BY.YIELD) {
      result = b.aggregatedYield - a.aggregatedYield;
    }

    // Apply sort direction
    return sortDirection === "asc" ? result : -result;
  };

  const unselectedSiteClass = `transition duration-200 ease-out hover:ease-in hover:bg-ocf-gray-700 cursor-pointer`;

  // Filter sites based on search term
  const filteredRows = filterSitesBySearchTerm(rows, searchTerm);

  // Show empty state if search returns no results
  if (searchTerm && filteredRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">No sites found</p>
          <p className="text-sm">Try adjusting your search: &quot;{searchTerm}&quot;</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1">
        {filteredRows?.sort(sortFn).map((site) => {
          const mostAccurateGeneration = site.actualPV || site.expectedPV;
          return (
            <React.Fragment key={`site-row-${site.id}`}>
              <div
                className={`${
                  clickedSiteGroupId === site.id
                    ? "bg-ocf-gray-800 text"
                    : "bg-ocf-delta-950 transition duration-200 ease-out hover:bg-ocf-gray-700 hover:ease-in"
                } mb-0.5 bg-ocf-delta-950 cursor-pointer relative  w-full 
            `}
                onClick={() => setClickedSiteGroupId(site.id)}
              >
                <div key={site.label} className={`flex flex-col`}>
                  <div className="flex flex-row justify-between text-sm">
                    <div className="ml-10 w-80">
                      <div className="py-3 text-white font-bold text-sm">{site.label}</div>
                    </div>
                    <div className="flex flex-row">
                      <div
                        className="text-white w-32
                         justify-center py-3 pr-10 font-bold flex flex-row text-sm"
                      >
                        <p>
                          <span className={!!site.actualPV ? "text-white" : "text-ocf-yellow"}>
                            {Number(site.aggregatedYield).toFixed()}
                          </span>
                          <span className="ocf-gray-400 text-xs">%</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-baseline text-white font-bold w-32 justify-center py-3 pr-10 text-sm">
                        <span className="whitespace-nowrap">
                          <span className={`pr-1${site.actualPV ? "" : " text-ocf-yellow"}`}>
                            {Number(mostAccurateGeneration).toFixed(
                              mostAccurateGeneration < 10 ? 1 : 0
                            )}
                          </span>{" "}
                          / {Number(site.capacity).toFixed()}
                        </span>
                        <span className="text-ocf-gray-400 text-xs font-thin pl-0.5 whitespace-nowrap">
                          KW
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 flex items-end justify-end flex-row-reverse w-full
               "
                >
                  <div
                    className={`${
                      clickedSiteGroupId === site.id ? "h-2" : "h-2"
                    } bg-ocf-yellow-500`}
                    style={{ width: `3px` }}
                  ></div>
                  <div
                    className={`h-1 bg-ocf-yellow-500`}
                    style={{
                      width: `${Number(site.aggregatedYield).toFixed()}%`
                    }}
                  ></div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export { TableHeader, TableData };

// Wrapper component for backward compatibility
export const AggregatedDataTable: React.FC<{
  tableData: AggregatedSitesDatum[];
  className?: string;
  title: string;
}> = ({ tableData, className, title }) => {
  return (
    <div className={className}>
      <TableHeader text={title} />
      <TableData rows={tableData} />
    </div>
  );
};
