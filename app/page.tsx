"use client"

import { useState, useEffect } from "react"
import { Trophy, RotateCcw, Users, Target, Award, Crown, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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

  const champion = tournament?.playoffs?.final?.winner

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
              <div
                className={`flex items-center gap-2 ${stage === "complete" ? "text-accent" : "text-muted-foreground"}`}
              >
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

        {stage === "complete" && champion && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Celebração principal */}
            <Card className="p-12 text-center glow-accent bg-gradient-to-br from-accent/20 via-card to-primary/10 border-accent relative overflow-hidden">
              {/* Efeitos de fundo */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-accent/20 rounded-full blur-3xl animate-pulse" />
                <div
                  className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <div
                  className="absolute top-1/2 left-1/4 w-16 h-16 bg-secondary/20 rounded-full blur-2xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>

              <div className="relative z-10">
                {/* Coroa animada */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Crown
                      className="h-24 w-24 md:h-32 md:w-32 text-accent animate-bounce"
                      style={{ animationDuration: "2s" }}
                    />
                    <div className="absolute inset-0 blur-3xl bg-accent/50 animate-pulse-glow" />
                    <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
                    <Sparkles
                      className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-400 animate-pulse"
                      style={{ animationDelay: "0.3s" }}
                    />
                    <Star
                      className="absolute top-0 -left-4 h-5 w-5 text-accent animate-pulse"
                      style={{ animationDelay: "0.6s" }}
                    />
                  </div>
                </div>

                {/* Nome do campeão */}
                <h2 className="text-4xl md:text-6xl font-extrabold mb-4 gradient-text">{champion.name}</h2>

                {/* Título */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Trophy className="h-6 w-6 text-accent" />
                  <p className="text-2xl md:text-3xl text-accent font-bold tracking-wider uppercase">
                    Campeão do Torneio!
                  </p>
                  <Trophy className="h-6 w-6 text-accent" />
                </div>

                {/* Linha decorativa */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
                  <Star className="h-4 w-4 text-accent" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
                </div>

                {/* Mensagem */}
                <p className="text-lg text-muted-foreground">Parabéns ao time vencedor por conquistar o título!</p>
              </div>
            </Card>

            {/* Estatísticas finais */}
            <Card className="p-6 glow-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Resumo do Torneio
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-primary">{tournament?.teams.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Times</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-secondary">{tournament?.groupMatches.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Partidas Fase de Grupos</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-accent">7</p>
                  <p className="text-sm text-muted-foreground">Partidas Playoffs</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-primary">1</p>
                  <p className="text-sm text-muted-foreground">Campeão</p>
                </div>
              </div>
            </Card>

            {/* Botão para novo torneio */}
            <div className="text-center">
              <Button onClick={handleReset} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Iniciar Novo Torneio
              </Button>
            </div>
          </div>
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
