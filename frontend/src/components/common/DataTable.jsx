import React, { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
} from "@mui/material";
import { TableSkeleton } from "./LoadingSkeleton.jsx";
import EmptyState from "./EmptyState.jsx";

function DataTable({
  columns,
  data,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onRowClick,
  minWidth = 650,
}) {
  const tableRef = useRef(null);

  if (isLoading) {
    return <TableSkeleton rows={limit || 5} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box ref={tableRef}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 3,
          },
        }}
      >
        <Table sx={{ minWidth: { xs: "auto", sm: minWidth } }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.headerAlign || col.align || "left"}
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    py: 2,
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.id || index}
                hover={!!onRowClick}
                onClick={() => onRowClick && onRowClick(row)}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    sx={{ px: { xs: 1.5, sm: 2 } }}
                  >
                    {col.render ? col.render(row[col.id], row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total !== undefined && onPageChange && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(e, newPage) => {
            onPageChange(newPage + 1);
            if (tableRef.current) {
              tableRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) =>
            onLimitChange(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            ".MuiTablePagination-toolbar": {
              justifyContent: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: { xs: 0.5, sm: 1 },
              px: { xs: 1, sm: 2 },
            },
            ".MuiTablePagination-spacer": {
              display: "none",
            },
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            ".MuiTablePagination-actions": {
              marginLeft: { xs: 0.5, sm: 2 },
            },
          }}
        />
      )}
    </Box>
  );
}

export default DataTable;
