import React, { useState, useEffect } from "react";
import "./TeamView.css";
import api from "../../services/api";

const TeamView = () => {
  const [team, setTeam] = useState({
    budget: 0,
    players: [],
  });

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await api.get("/team/my-team");
        const teamData = response.data;

        setTeam({
          budget: teamData.budget,
          name: teamData.name,
          players: teamData.players,
        });
      } catch (error) {
        console.error("Error fetching team details:", error);
      }
    };

    fetchTeamDetails();
  }, []);

  return (
    <div className="team-view">
      <h2>My Team {team.name}</h2>
      <div className="team-budget">
        <strong>Budget:</strong> ${team.budget.toLocaleString()}
      </div>
      <div className="players-list">
        <h3>Players</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {team.players.map((player) => (
              <tr key={player._id}>
                <td>{player.name}</td>
                <td>{player.position}</td>
                <td>${player.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamView;
