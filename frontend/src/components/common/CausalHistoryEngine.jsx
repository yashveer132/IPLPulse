import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Link } from 'react-router-dom';

const CausalHistoryEngine = ({ graphData }) => {
  if (!graphData) return null;
  const { root, upstream, downstream } = graphData;

  if (!upstream?.length && !downstream?.length) return null;

  const renderNode = (node, isRoot = false) => {
    if (!node) return null;
    return (
      <Paper
        component={isRoot ? 'div' : Link}
        to={isRoot ? undefined : `/flashpoints/${node.id}`}
        sx={{
          p: 2,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 3,
          border: isRoot ? '2px solid #e52e71' : '1px solid rgba(255,255,255,0.1)',
          bgcolor: isRoot ? 'rgba(229,46,113,0.05)' : 'background.paper',
          '&:hover': isRoot ? {} : { bgcolor: 'action.hover', transform: 'translateY(-2px)', transition: 'all 0.2s' }
        }}
      >
        <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>{node.year}</Typography>
        <Typography variant="body1" sx={{ fontWeight: isRoot ? 800 : 600, color: 'text.primary' }}>
          {node.title}
        </Typography>
      </Paper>
    );
  };

  const renderRelation = (type) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', letterSpacing: 1, mb: 0.5 }}>
        {type}
      </Typography>
      <ArrowDownwardIcon color="primary" sx={{ opacity: 0.5 }} />
    </Box>
  );

  const renderUpstreamChain = (edges) => {
    if (!edges || edges.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {edges.map((edge, i) => (
          <Box key={`up-${i}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
            {renderUpstreamChain(edge.parents)}
            {renderNode(edge.node, false)}
            {renderRelation(edge.type)}
          </Box>
        ))}
      </Box>
    );
  };

  const renderDownstreamChain = (edges) => {
    if (!edges || edges.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', width: '100%' }}>
        {edges.map((edge, i) => (
          <Box key={`down-${i}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
            {renderRelation(edge.type)}
            {renderNode(edge.node, false)}
            {renderDownstreamChain(edge.children)}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.2)', width: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, textAlign: 'center', position: 'sticky', left: 0 }}>
        Causal History Engine
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minWidth: 'min-content' }}>
        {renderUpstreamChain(upstream)}
        {renderNode(root, true)}
        {renderDownstreamChain(downstream)}
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center', position: 'sticky', left: 0 }}>
        <Typography variant="caption" color="text.secondary">
          Displaying depth-2 causality flow. Scroll horizontally to explore branches.
        </Typography>
      </Box>
    </Paper>
  );
};

export default CausalHistoryEngine;
