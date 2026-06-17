import { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import { usePlayers } from "../../hooks/usePlayer.js";
import { useFranchises } from "../../hooks/useFranchise.js";

function SearchAutocomplete({
  sx = {},
  size = "small",
  placeholder = "Search players, franchises...",
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);

  const [debouncedValue, setDebouncedValue] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: playersData, isLoading: isLoadingPlayers } = usePlayers(
    { search: debouncedValue, limit: 5 },
    { enabled: debouncedValue.length > 1 },
  );

  const { data: franchises } = useFranchises();

  useEffect(() => {
    if (debouncedValue.length <= 1) {
      setOptions([]);
      return;
    }

    const newOptions = [];

    if (franchises) {
      const filteredTeams = franchises.filter(
        (f) =>
          f.name.toLowerCase().includes(debouncedValue.toLowerCase()) ||
          f.shortName.toLowerCase().includes(debouncedValue.toLowerCase()),
      );
      newOptions.push(
        ...filteredTeams.map((f) => ({
          type: "Franchise",
          id: f.shortName,
          label: f.name,
          subtitle: f.shortName,
          color: f.color,
        })),
      );
    }

    if (playersData?.players) {
      newOptions.push(
        ...playersData.players.map((p) => ({
          type: "Player",
          id: p.id,
          label: p.name,
          subtitle: p.role,
        })),
      );
    }

    setOptions(newOptions);
  }, [debouncedValue, playersData, franchises]);

  const isLoading = debouncedValue.length > 1 && isLoadingPlayers;

  return (
    <Autocomplete
      id="global-search"
      sx={{ width: "100%", maxWidth: 400, ...sx }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      onChange={(event, newValue) => {
        if (newValue) {
          if (newValue.type === "Player") {
            navigate(`/players/${newValue.id}`);
          } else if (newValue.type === "Franchise") {
            navigate(`/franchises/${newValue.id}`);
          }
          setInputValue("");
          setOpen(false);
        }
      }}
      options={options}
      groupBy={(option) => option.type}
      getOptionLabel={(option) => option.label}
      loading={isLoading}
      filterOptions={(x) => x}
      noOptionsText={
        debouncedValue.length > 1 ? "No results found" : "Type to search..."
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          size={size}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps?.endAdornment}
                </>
              ),
              sx: {
                borderRadius: 4,
                bgcolor: "background.paper",
                ...sx.inputStyle,
              },
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          {option.type === "Player" ? (
            <PersonIcon color="action" />
          ) : (
            <GroupIcon sx={{ color: option.color }} />
          )}
          <Box>
            <Typography variant="body2">{option.label}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.subtitle}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
}

export default SearchAutocomplete;
