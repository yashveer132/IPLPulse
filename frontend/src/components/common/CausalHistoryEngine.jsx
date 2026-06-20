import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const CausalHistoryEngine = ({ graphData }) => {
  if (!graphData) return null;
  const { root, upstream, downstream } = graphData;

  if (!upstream?.length && !downstream?.length) return null;

  const renderNode = (node, isRoot = false) => {
    if (!node) return null;
    const card = (
      <Paper
        sx={{
          p: 2.5,
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          borderRadius: 3,
          border: isRoot
            ? "2px solid #e52e71"
            : "1px solid rgba(99, 102, 241, 0.25)",
          bgcolor: isRoot ? "rgba(229,46,113,0.06)" : "background.paper",
          boxShadow: isRoot
            ? "0 0 15px rgba(229, 46, 113, 0.2)"
            : "0 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": isRoot
            ? {}
            : {
                bgcolor: "action.hover",
                borderColor: "primary.main",
                boxShadow: "0 6px 20px rgba(139, 92, 246, 0.15)",
              },
        }}
      >
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ mb: 0.5, fontWeight: "bold" }}
        >
          {node.year}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: isRoot ? 800 : 600,
            color: "text.primary",
            lineHeight: 1.4,
          }}
        >
          {node.title}
        </Typography>
      </Paper>
    );

    if (isRoot) return card;

    return (
      <Link
        to={`/flashpoints/${node.id}`}
        style={{
          textDecoration: "none",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {card}
      </Link>
    );
  };

  const renderUpstreamChain = (edges) => {
    if (!edges || edges.length === 0) return null;
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            width: "100%",
            alignItems: "flex-end",
          }}
        >
          {edges.map((edge, i) => {
            const hasParents = edge.parents && edge.parents.length > 0;
            return (
              <Box
                key={`up-${i}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1 1 0px",
                  minWidth: 200,
                }}
              >
                {hasParents && renderUpstreamChain(edge.parents)}

                {hasParents && (
                  <Box sx={{ width: "100%", height: 45, my: 1 }}>
                    <svg
                      width="100%"
                      height="100%"
                      style={{ overflow: "visible" }}
                    >
                      {edge.parents.map((gp, gpIdx) => {
                        const startX = `${((gpIdx + 0.5) / edge.parents.length) * 100}%`;
                        return (
                          <g key={gpIdx}>
                            <line
                              x1={startX}
                              y1="0"
                              x2="50%"
                              y2="100%"
                              stroke="#8b5cf6"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              opacity="0.6"
                              markerEnd="url(#arrow-marker)"
                            />
                            <foreignObject
                              x={`calc(${startX} + (50% - ${startX}) * 0.5 - 40px)`}
                              y="12"
                              width="80"
                              height="20"
                            >
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "9px",
                                  fontWeight: "bold",
                                  color: "#a78bfa",
                                  backgroundColor: "#1e1e1e",
                                  padding: "1px 3px",
                                  borderRadius: "3px",
                                  border: "1px solid rgba(139, 92, 246, 0.3)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {gp.type}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                  </Box>
                )}

                {renderNode(edge.node, false)}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderDownstreamChain = (edges) => {
    if (!edges || edges.length === 0) return null;
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          {edges.map((edge, i) => {
            const hasChildren = edge.children && edge.children.length > 0;
            return (
              <Box
                key={`down-${i}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: "1 1 0px",
                  minWidth: 200,
                }}
              >
                {renderNode(edge.node, false)}

                {hasChildren && (
                  <Box sx={{ width: "100%", height: 45, my: 1 }}>
                    <svg
                      width="100%"
                      height="100%"
                      style={{ overflow: "visible" }}
                    >
                      {edge.children.map((child, childIdx) => {
                        const endX = `${((childIdx + 0.5) / edge.children.length) * 100}%`;
                        return (
                          <g key={childIdx}>
                            <line
                              x1="50%"
                              y1="0"
                              x2={endX}
                              y2="100%"
                              stroke="#8b5cf6"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              opacity="0.6"
                              markerEnd="url(#arrow-marker)"
                            />
                            <foreignObject
                              x={`calc(50% + (${endX} - 50%) * 0.5 - 40px)`}
                              y="12"
                              width="80"
                              height="20"
                            >
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "9px",
                                  fontWeight: "bold",
                                  color: "#a78bfa",
                                  backgroundColor: "#1e1e1e",
                                  padding: "1px 3px",
                                  borderRadius: "3px",
                                  border: "1px solid rgba(139, 92, 246, 0.3)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {child.type}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                  </Box>
                )}

                {hasChildren && renderDownstreamChain(edge.children)}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 4 },
        mb: 4,
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.01)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        width: "100%",
        overflowX: "auto",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <marker
            id="arrow-marker"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6" />
          </marker>
        </defs>
      </svg>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          mb: 4,
          textAlign: "center",
          position: "sticky",
          left: 0,
        }}
      >
        Causal History Engine
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          minWidth: "min-content",
          px: 2,
        }}
      >
        {upstream && upstream.length > 0 && renderUpstreamChain(upstream)}

        {upstream && upstream.length > 0 && (
          <Box sx={{ width: "100%", height: 50, my: 1 }}>
            <svg width="100%" height="100%" style={{ overflow: "visible" }}>
              {upstream.map((edge, i) => {
                const startX = `${((i + 0.5) / upstream.length) * 100}%`;
                return (
                  <g key={i}>
                    <line
                      x1={startX}
                      y1="0"
                      x2="50%"
                      y2="100%"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.6"
                      markerEnd="url(#arrow-marker)"
                    />
                    <foreignObject
                      x={`calc(${startX} + (50% - ${startX}) * 0.5 - 45px)`}
                      y="15"
                      width="90"
                      height="20"
                    >
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "9px",
                          fontWeight: "bold",
                          color: "#a78bfa",
                          backgroundColor: "#1e1e1e",
                          padding: "1.5px 3px",
                          borderRadius: "3px",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {edge.type}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </Box>
        )}

        {renderNode(root, true)}

        {downstream && downstream.length > 0 && (
          <Box sx={{ width: "100%", height: 50, my: 1 }}>
            <svg width="100%" height="100%" style={{ overflow: "visible" }}>
              {downstream.map((edge, i) => {
                const endX = `${((i + 0.5) / downstream.length) * 100}%`;
                return (
                  <g key={i}>
                    <line
                      x1="50%"
                      y1="0"
                      x2={endX}
                      y2="100%"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.6"
                      markerEnd="url(#arrow-marker)"
                    />
                    <foreignObject
                      x={`calc(50% + (${endX} - 50%) * 0.5 - 45px)`}
                      y="15"
                      width="90"
                      height="20"
                    >
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "9px",
                          fontWeight: "bold",
                          color: "#a78bfa",
                          backgroundColor: "#1e1e1e",
                          padding: "1.5px 3px",
                          borderRadius: "3px",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {edge.type}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </Box>
        )}

        {downstream &&
          downstream.length > 0 &&
          renderDownstreamChain(downstream)}
      </Box>
    </Paper>
  );
};

export default CausalHistoryEngine;
