import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  EmptySearchIllustration,
  EmptyInboxIllustration
} from "@/components/ui/illustrations";

/**
 * Interactive data table with engaging empty states and animations
 */
export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyState,
  searchPlaceholder = "Search...",
  enableSearch = true,
  enablePagination = true,
  enableFiltering = false,
  onRowClick,
  actionMenu,
  searchDebounce = 300,
  pageSize = 10,
  currentPage = 0,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  onSearch,
  onRefresh,
  className = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRows, setExpandedRows] = useState({});
  const [visibleActionsRow, setVisibleActionsRow] = useState(null);

  const handleSearch = (value) => {
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, searchDebounce);
    
    setSearchTimeout(timeout);
  };

  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New sort column
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const toggleRowExpanded = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
    
    // Close action menu when expanding/collapsing
    setVisibleActionsRow(null);
  };

  const toggleActionMenu = (e, rowId) => {
    e.stopPropagation();
    setVisibleActionsRow(visibleActionsRow === rowId ? null : rowId);
  };

  const isRowExpanded = (rowId) => {
    return expandedRows[rowId] || false;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      backgroundColor: "#f9fafb",
      transition: { duration: 0.2 }
    }
  };

  const expandedRowVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  const actionMenuVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.15 }
    }
  };

  const renderColumnHeader = (column) => {
    const isSorted = sortColumn === column.id;
    const sortIcon = isSorted ? (
      sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
    ) : null;
    
    return (
      <th
        key={column.id}
        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
          column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
        } ${column.width ? column.width : ''}`}
        onClick={() => column.sortable ? handleSort(column.id) : null}
      >
        <div className="flex items-center space-x-1">
          <span>{column.header}</span>
          {column.sortable && (
            <motion.div 
              animate={{ opacity: isSorted ? 1 : 0.3 }}
              className="text-gray-400"
            >
              {isSorted ? sortIcon : <ChevronDown size={16} />}
            </motion.div>
          )}
        </div>
      </th>
    );
  };

  const renderLoadingState = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="overflow-hidden">
          <div className="align-middle inline-block min-w-full">
            <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map(column => (
                      <th
                        key={column.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <Skeleton className="h-4 w-24" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array(5).fill(0).map((_, idx) => (
                    <tr key={idx}>
                      {columns.map(column => (
                        <td key={`${idx}-${column.id}`} className="px-4 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Loading shimmer effect */}
        <motion.div
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{
            x: ["0%", "100%"],
            transition: {
              repeat: Infinity,
              duration: 1.5,
              ease: "linear"
            }
          }}
        />
      </motion.div>
    );
  };

  const renderEmptyState = () => {
    // Show search empty state if we have a search query but no results
    if (searchQuery && onSearch) {
      return (
        <EmptyState
          title="No results found"
          description={`We couldn't find any results matching "${searchQuery}". Try checking for typos or using different search terms.`}
          icon={<EmptySearchIllustration className="text-gray-400" />}
          action={(label) => (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                handleSearch("");
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          )}
        />
      );
    }
    
    // Otherwise, show the default empty state or the provided one
    return emptyState || (
      <EmptyState
        title="No data available"
        description="There are currently no items to display."
        icon={<EmptyInboxIllustration className="text-gray-400" />}
        action={onRefresh ? (label) => (
          <Button onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        ) : null}
      />
    );
  };

  if (loading) {
    return renderLoadingState();
  }

  if (!data || data.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className={`relative ${className}`}>
      {/* Table Controls */}
      {(enableSearch || enableFiltering || onRefresh) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {enableSearch && (
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => handleSearch("")}
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {enableFiltering && (
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            )}
            
            {onRefresh && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRefresh}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
              </motion.div>
            )}
            
            {data.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden">
        <div className="align-middle inline-block min-w-full">
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
            <motion.table
              className="min-w-full divide-y divide-gray-200"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(renderColumnHeader)}
                  {actionMenu && (
                    <th className="relative px-4 py-3 w-10">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <motion.tbody 
                className="bg-white divide-y divide-gray-200"
              >
                {data.map((row, rowIndex) => (
                  <React.Fragment key={row.id || rowIndex}>
                    <motion.tr
                      variants={rowVariants}
                      whileHover={onRowClick ? "hover" : {}}
                      onClick={() => onRowClick ? onRowClick(row) : toggleRowExpanded(row.id || rowIndex)}
                      className={`${onRowClick || row.expandedContent ? 'cursor-pointer' : ''} ${
                        isRowExpanded(row.id || rowIndex) ? 'bg-blue-50' : ''
                      }`}
                    >
                      {columns.map(column => (
                        <td key={column.id} className="px-4 py-4 whitespace-nowrap">
                          {column.cell ? column.cell(row) : row[column.id]}
                        </td>
                      ))}
                      
                      {actionMenu && (
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => toggleActionMenu(e, row.id || rowIndex)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <MoreHorizontal size={16} />
                          </motion.button>
                          
                          <AnimatePresence>
                            {visibleActionsRow === (row.id || rowIndex) && (
                              <motion.div
                                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                variants={actionMenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                              >
                                <div className="py-1">
                                  {actionMenu(row)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      )}
                    </motion.tr>
                    
                    {/* Expandable row content */}
                    {row.expandedContent && (
                      <AnimatePresence>
                        {isRowExpanded(row.id || rowIndex) && (
                          <motion.tr
                            variants={expandedRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <td
                              colSpan={columns.length + (actionMenu ? 1 : 0)}
                              className="px-4 py-4 bg-gray-50"
                            >
                              {row.expandedContent}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    )}
                  </React.Fragment>
                ))}
              </motion.tbody>
            </motion.table>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <motion.div
          className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 mt-2 sm:rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex-1 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize + 1, totalItems)}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min((currentPage + 1) * pageSize, totalItems)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{totalItems}</span>
              {' '}results
            </div>
            
            <div className="flex space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={16} />
                  <span className="ml-1">Previous</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  <span className="mr-1">Next</span>
                  <ChevronRight size={16} />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}