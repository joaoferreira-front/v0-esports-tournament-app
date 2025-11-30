"use client"

import { useState, useEffect } from "react"
import { Trophy, Target, ArrowRight, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { Tournament, Team, GroupStanding, Match } from "@/types/tournament"

interface GroupStageProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
  onComplete: (qualifiedTeams: Team[]) => void
}

export default function GroupStage({ tournament, onUpdate, onComplete }: GroupStageProps) {
  useEffect(() => {
    const standings: GroupStanding[] = tournament.teams.map((team) => ({
      team,
      wins: 0,
      losses: 0,
      roundsWon: 0,
      roundsLost: 0,
      points: 0,
    }))

    // Processar todas as partidas finalizadas
    tournament.groupMatches.forEach((match) => {
      if (match.winner) {
        const team1Standing = standings.find((s) => s.team.id === match.team1?.id)
        const team2Standing = standings.find((s) => s.team.id === match.team2?.id)

        if (team1Standing && team2Standing) {
          team1Standing.roundsWon += match.score1
          team1Standing.roundsLost += match.score2
          team2Standing.roundsWon += match.score2
          team2Standing.roundsLost += match.score1

          if (match.winner.id === match.team1?.id) {
            team1Standing.wins += 1
            team1Standing.points += 3
            team2Standing.losses += 1
          } else {
            team2Standing.wins += 1
            team2Standing.points += 3
            team1Standing.losses += 1
          }
        }
      }
    })

    // Ordenar por pontos, depois por saldo de rounds
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.roundsWon - b.roundsLost - (a.roundsWon - a.roundsLost)
    })

    const currentStandingsString = JSON.stringify(tournament.groupStandings)
    const newStandingsString = JSON.stringify(standings)

    if (currentStandingsString !== newStandingsString) {
      onUpdate({ ...tournament, groupStandings: standings })
    }
  }, [tournament]) // Updated dependency array

  const handleMatchResult = (matchIndex: number, score1: number, score2: number) => {
    const newMatches = [...tournament.groupMatches]
    const match = newMatches[matchIndex]

    match.score1 = score1
    match.score2 = score2
    match.winner = score1 > score2 ? match.team1 : match.team2

    onUpdate({ ...tournament, groupMatches: newMatches })
  }

  const getQualifiedTeams = () => {
    return tournament.groupStandings.slice(0, 8).map((s) => s.team)
  }

  // Verificar se todas as partidas foram jogadas
  const allMatchesPlayed = tournament.groupMatches.every((m) => m.winner !== null)
  const canAdvance = allMatchesPlayed && tournament.groupStandings.length >= 8

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 glow-border bg-gradient-to-r from-card to-card/50">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Fase de Pontos Corridos (MD1)</h2>
        <p className="text-muted-foreground">
          Todos contra todos em melhor de 1. Os 8 melhores avançam para os playoffs.
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Matches */}
        <Card className="p-6 glow-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Partidas ({tournament.groupMatches.filter((m) => m.winner).length}/{tournament.groupMatches.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {tournament.groupMatches.map((match, index) => (
              <MatchInput
                key={index}
                match={match}
                onResult={(score1, score2) => handleMatchResult(index, score1, score2)}
              />
            ))}
          </div>
        </Card>

        {/* Standings */}
        <Card className="p-6 glow-border sticky top-24">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Classificação Geral
          </h3>
          {tournament.groupStandings.length > 0 ? (
            <div className="space-y-2">
              {tournament.groupStandings.map((standing, index) => (
                <div
                  key={standing.team.id}
                  className={`p-4 rounded-lg border transition-all ${
                    index < 8
                      ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                      : "border-border bg-background opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index < 8 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{standing.team.name}</span>
                      {index < 8 && <Circle className="h-2 w-2 fill-accent text-accent animate-pulse" />}
                    </div>
                    <span className="text-xl font-bold text-primary">{standing.points} pts</span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>V: {standing.wins}</span>
                    <span>D: {standing.losses}</span>
                    <span>
                      Rounds: {standing.roundsWon}-{standing.roundsLost}
                    </span>
                    <span className="font-medium">Saldo: {standing.roundsWon - standing.roundsLost}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aguardando resultados das partidas...</p>
          )}
        </Card>
      </div>

      {/* Advance Button */}
      {canAdvance && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onComplete(getQualifiedTeams())}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-lg px-8 py-6 gap-3 glow-secondary"
          >
            Avançar para Playoffs (Top 8)
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}

function MatchInput({ match, onResult }: { match: Match; onResult: (score1: number, score2: number) => void }) {
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")
  const [submitted, setSubmitted] = useState(!!match.winner)

  const handleSubmit = () => {
    const s1 = Number.parseInt(score1) || 0
    const s2 = Number.parseInt(score2) || 0

    // MD1: apenas 0 ou 1
    if (s1 === s2) {
      alert("MD1: Um time deve vencer (use 1-0 ou 0-1)")
      return
    }

    onResult(s1, s2)
    setSubmitted(true)
  }

  return (
    <div className={`p-4 rounded-lg border ${submitted ? "bg-muted/50 border-accent" : "bg-background border-border"}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <p className={`font-medium ${match.winner?.id === match.team1?.id ? "text-accent" : ""}`}>
            {match.team1?.name}
          </p>
        </div>
        <span className="text-muted-foreground font-bold text-sm">VS</span>
        <div className="flex-1 text-right">
          <p className={`font-medium ${match.winner?.id === match.team2?.id ? "text-accent" : ""}`}>
            {match.team2?.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!submitted ? (
          <>
            <Input
              type="number"
              min="0"
              max="1"
              placeholder="0"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className="w-16 text-center bg-background"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min="0"
              max="1"
              placeholder="0"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              className="w-16 text-center bg-background"
            />
            <Button onClick={handleSubmit} disabled={!score1 || !score2} size="sm" className="ml-auto">
              Registrar
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 w-full">
            <span className="text-2xl font-bold text-primary">{match.score1}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-2xl font-bold text-primary">{match.score2}</span>
            <span className="ml-auto text-sm text-accent font-medium">✓ Registrado</span>
          </div>
        )}
      </div>
    </div>
  )
}
