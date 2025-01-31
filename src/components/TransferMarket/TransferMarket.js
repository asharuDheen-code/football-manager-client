import React, { useState, useEffect } from "react";
import "./TransferMarket.css";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const TransferMarket = () => {
  const [players, setPlayers] = useState([]);
  const [myTeamPlayers, setMyTeamPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    position: "",
    minPrice: 0,
    maxPrice: 1000000,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const MIN_ASKING_PRICE = 100000;

  const openSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await api.get("/transfer/market");
        setPlayers(response.data.players);
        setMyTeamPlayers(response.data.myTeamPlayers);
      } catch (err) {
        console.error("Error fetching players:", err);
        openSnackbar("Failed to fetch players", "error");
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchTransferList = async () => {
      try {
        const response = await api.get("/transfer/transfer-list");
        setAvailablePlayers(response.data.transfers);
      } catch (err) {
        console.error("Error fetching transfer list:", err);
        openSnackbar("Failed to fetch transfer list", "error");
      }
    };

    fetchTransferList();
  }, [players, myTeamPlayers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredPlayers = availablePlayers
    .filter((transfer) => {
      return (
        transfer.player.name
          .toLowerCase()
          .includes(filters.name.toLowerCase()) &&
        (filters.position === "" ||
          transfer.player.position === filters.position) &&
        transfer.price >= filters.minPrice &&
        transfer.price <= filters.maxPrice
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const toggleTransferList = async (
    playerId,
    isOnTransferList,
    askingPrice
  ) => {
    if (askingPrice < MIN_ASKING_PRICE) {
      openSnackbar(
        `Asking price must be at least ₹${MIN_ASKING_PRICE.toLocaleString()}`,
        "error"
      );
      return;
    }

    try {
      const { data } = await api.post("/transfer/toggle", {
        playerId,
        isOnTransferList: !isOnTransferList,
        askingPrice,
      });

      setMyTeamPlayers(data.players);

      // Reset asking price for all players in the team to 0 after the transfer list update
      const updatedPlayers = data.players.map((player) => ({
        ...player,
        askingPrice: 0, // Reset asking price for all players
      }));
      setMyTeamPlayers(updatedPlayers);

      const { data: transferListData } = await api.get(
        "/transfer/transfer-list"
      );
      setAvailablePlayers(transferListData.transfers);

      openSnackbar(
        `Player ${isOnTransferList ? "removed from" : "added to"} transfer list`
      );
    } catch (err) {
      console.error("Error toggling transfer list:", err);
      const message =
        err.response?.data.message || "Failed to update transfer list";
      openSnackbar(message, "error");
    }
  };

  const buyPlayer = async (playerId, askingPrice) => {
    try {
      const response = await api.post("/transfer/buy", {
        playerId,
        price: askingPrice * 0.95,
      });

      setPlayers(response.data.players);
      setMyTeamPlayers(response.data.myTeamPlayers);

      // Reset asking price for all players in the team to 0 after a successful buy
      const updatedPlayers = response.data.myTeamPlayers.map((player) => ({
        ...player,
        askingPrice: 0, // Reset asking price for all players
      }));
      setMyTeamPlayers(updatedPlayers);

      const transferListResponse = await api.get("/transfer/transfer-list");
      setAvailablePlayers(transferListResponse.data.transfers);

      openSnackbar("Player bought successfully!");
    } catch (err) {
      console.error("Error buying player:", err);
      openSnackbar(
        "Failed to buy player. Check your budget or team size.",
        "error"
      );
    }
  };

  return (
    <div className="transfer-market">
      <h2>Transfer Market</h2>

      <div className="filters">
        <input
          type="text"
          name="name"
          placeholder="Search by player name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <select
          name="position"
          value={filters.position}
          onChange={handleFilterChange}
        >
          <option value="">All Positions</option>
          <option value="Goalkeeper">Goalkeeper</option>
          <option value="Defender">Defender</option>
          <option value="Midfielder">Midfielder</option>
          <option value="Attacker">Attacker</option>
        </select>
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
      </div>

      <div className="section">
        <h3>Available Players</h3>
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Asking Price</th>
                <th>Seller Team</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((transfer) => (
                <tr key={transfer._id}>
                  <td>{transfer.player.name}</td>
                  <td>{transfer.player.position}</td>
                  <td>${transfer.price.toLocaleString()}</td>
                  <td>{transfer.fromTeam.name}</td>
                  <td>
                    <button
                      onClick={() =>
                        buyPlayer(transfer.player._id, transfer.price)
                      }
                    >
                      Buy (${(transfer.price * 0.95).toLocaleString()})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h3>My Team Players</h3>
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Asking Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myTeamPlayers.map((player) => (
                <tr key={player._id}>
                  <td>{player.name}</td>
                  <td>{player.position}</td>
                  <td>
                    <input
                      type="number"
                      value={player.askingPrice}
                      onChange={(e) => {
                        const updatedPlayers = myTeamPlayers.map((p) =>
                          p._id === player._id
                            ? { ...p, askingPrice: Number(e.target.value) }
                            : p
                        );
                        setMyTeamPlayers(updatedPlayers);
                      }}
                      onBlur={() =>
                        toggleTransferList(
                          player._id,
                          player.isOnTransferList,
                          player.askingPrice
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        toggleTransferList(
                          player._id,
                          player.isOnTransferList,
                          player.askingPrice
                        )
                      }
                    >
                      {player.isOnTransferList
                        ? "Remove from Transfer List"
                        : "Add to Transfer List"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TransferMarket;
