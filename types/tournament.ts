export type TournamentStage = "setup" | "groups" | "playoffs" | "complete"

export interface Team {
  id: string
  name: string
  logo?: string
}

export interface Match {
  team1: Team | null
  team2: Team | null
  score1: number
  score2: number
  winner: Team | null
  bestOf: number // 1 para MD1, 3 para MD3, 5 para MD5
  mapsPlayed?: number[] // Array de mapas/rounds jogados
}

export interface GroupStanding {
  team: Team
  wins: number
  losses: number
  roundsWon: number
  roundsLost: number
  points: number
}

export interface Playoffs {
  quarters: Match[]
  semis: Match[]
  final: Match
}

export interface Tournament {
  teams: Team[]
  groupMatches: Match[] // Todas as partidas da fase de grupos (MD1)
  groupStandings: GroupStanding[] // Classificação única
  playoffs: Playoffs | null
}
