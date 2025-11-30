"use client"

import { useState, useEffect } from "react"
import { Trophy, RotateCcw, Users, Target, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import TeamSetup from "@/components/tournament/team-setup"
import GroupStage from "@/components/tournament/group-stage"
import Playoffs from "@/components/tournament/playoffs"
import type { Tournament, TournamentStage, Team, Match } from "@/types/tournament"

export default function TournamentManager() {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [stage, setStage] = useState<TournamentStage>("setup")

  useEffect(() => {
    console.log("[v0] Carregando torneio do localStorage...")
    const saved = localStorage.getItem("esports-tournament")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        console.log("[v0] Torneio carregado:", data)
        setTournament(data.tournament)
        setStage(data.stage)
      } catch (error) {
        console.error("[v0] Erro ao carregar torneio:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (tournament) {
      const data = { tournament, stage }
      localStorage.setItem("esports-tournament", JSON.stringify(data))
      console.log("[v0] Torneio salvo no localStorage")
    }
  }, [tournament, stage])

  const handleStartTournament = (teams: Team[]) => {
    const matches: Match[] = []

    // Criar partidas round-robin (todos contra todos)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          team1: teams[i],
          team2: teams[j],
          score1: 0,
          score2: 0,
          winner: null,
          bestOf: 1, // MD1 para fase de grupos
          mapsPlayed: [],
        })
      }
    }

    setTournament({
      teams,
      groupMatches: matches,
      groupStandings: [],
      playoffs: null,
    })
    setStage("groups")
  }

  const handleGroupStageComplete = (qualifiedTeams: Team[]) => {
    if (!tournament) return

    const playoffs = {
      quarters: Array.from({ length: 4 }, (_, i) => ({
        team1: qualifiedTeams[i * 2] || null,
        team2: qualifiedTeams[i * 2 + 1] || null,
        winner: null,
        score1: 0,
        score2: 0,
        bestOf: 3, // MD3 para quartas
      })),
      semis: Array.from({ length: 2 }, () => ({
        team1: null,
        team2: null,
        winner: null,
        score1: 0,
        score2: 0,
        bestOf: 3, // MD3 para semifinais
      })),
      final: {
        team1: null,
        team2: null,
        winner: null,
        score1: 0,
        score2: 0,
        bestOf: 5, // MD5 para final
      },
    }

    setTournament({ ...tournament, playoffs })
    setStage("playoffs")
  }

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar o torneio? Todos os dados serão perdidos.")) {
      setTournament(null)
      setStage("setup")
      localStorage.removeItem("esports-tournament")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse-glow" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">E-Sports Tournament Manager</h1>
            </div>
            {stage !== "setup" && (
              <Button onClick={handleReset} variant="destructive" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Resetar</span>
              </Button>
            )}
          </div>

          {/* Stage Indicator */}
          {stage !== "setup" && (
            <div className="flex items-center gap-4 mt-4">
              <div
                className={`flex items-center gap-2 ${stage === "groups" ? "text-primary" : "text-muted-foreground"}`}
              >
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Pontos Corridos (MD1)</span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div
                className={`flex items-center gap-2 ${stage === "playoffs" ? "text-secondary" : "text-muted-foreground"}`}
              >
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Playoffs (MD3/MD5)</span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Campeão</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {stage === "setup" && <TeamSetup onStart={handleStartTournament} />}

        {stage === "groups" && tournament && (
          <GroupStage tournament={tournament} onUpdate={setTournament} onComplete={handleGroupStageComplete} />
        )}

        {stage === "playoffs" && tournament && tournament.playoffs && (
          <Playoffs tournament={tournament} onUpdate={setTournament} onComplete={() => setStage("complete")} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            E-Sports Tournament Manager - Gerenciamento profissional de torneios
          </p>
        </div>
      </footer>
    </div>
  )
}
