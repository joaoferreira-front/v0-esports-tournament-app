"use client"

import { useState } from "react"
import { Trophy, Award, Crown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { Tournament, Match } from "@/types/tournament"

interface PlayoffsProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
  onComplete: () => void
}

export default function Playoffs({ tournament, onUpdate, onComplete }: PlayoffsProps) {
  if (!tournament.playoffs) return null

  const handleMatchResult = (
    stage: "quarters" | "semis" | "final",
    matchIndex: number,
    score1: number,
    score2: number,
  ) => {
    const newPlayoffs = { ...tournament.playoffs! }

    if (stage === "final") {
      const match = newPlayoffs.final
      match.score1 = score1
      match.score2 = score2
      match.winner = score1 > score2 ? match.team1 : match.team2
    } else {
      const match = newPlayoffs[stage][matchIndex]
      match.score1 = score1
      match.score2 = score2
      match.winner = score1 > score2 ? match.team1 : match.team2

      // Avançar vencedor para próxima fase
      if (stage === "quarters") {
        const semiIndex = Math.floor(matchIndex / 2)
        if (matchIndex % 2 === 0) {
          newPlayoffs.semis[semiIndex].team1 = match.winner
        } else {
          newPlayoffs.semis[semiIndex].team2 = match.winner
        }
      } else if (stage === "semis") {
        if (matchIndex === 0) {
          newPlayoffs.final.team1 = match.winner
        } else {
          newPlayoffs.final.team2 = match.winner
        }
      }
    }

    onUpdate({ ...tournament, playoffs: newPlayoffs })

    // Verificar se torneio está completo
    if (stage === "final" && newPlayoffs.final.winner) {
      onComplete()
    }
  }

  const champion = tournament.playoffs.final.winner

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="p-6 glow-border bg-gradient-to-r from-card to-card/50">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Playoffs - Mata-Mata</h2>
        <p className="text-muted-foreground">Quartas e Semis em MD3 • Final em MD5</p>
      </Card>

      {/* Champion Display */}
      {champion && (
        <Card className="p-8 text-center glow-accent bg-gradient-to-br from-accent/20 to-accent/5 border-accent">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Crown className="h-20 w-20 text-accent" />
              <div className="absolute inset-0 blur-3xl bg-accent/50 animate-pulse-glow" />
            </div>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-2">{champion.name}</h3>
          <p className="text-xl text-accent font-bold">CAMPEÃO DO TORNEIO!</p>
        </Card>
      )}

      {/* Brackets */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quarters */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Quartas (MD3)
          </h3>
          {tournament.playoffs.quarters.map((match, index) => (
            <BracketMatch
              key={index}
              match={match}
              onResult={(s1, s2) => handleMatchResult("quarters", index, s1, s2)}
            />
          ))}
        </div>

        {/* Semis */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-secondary" />
            Semifinal (MD3)
          </h3>
          <div className="space-y-20">
            {tournament.playoffs.semis.map((match, index) => (
              <BracketMatch
                key={index}
                match={match}
                onResult={(s1, s2) => handleMatchResult("semis", index, s1, s2)}
              />
            ))}
          </div>
        </div>

        {/* Final */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Grande Final (MD5)
          </h3>
          <div className="mt-32">
            <BracketMatch
              match={tournament.playoffs.final}
              onResult={(s1, s2) => handleMatchResult("final", 0, s1, s2)}
              isFinal
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BracketMatch({
  match,
  onResult,
  isFinal = false,
}: {
  match: Match
  onResult: (score1: number, score2: number) => void
  isFinal?: boolean
}) {
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")
  const [submitted, setSubmitted] = useState(!!match.winner)

  const maxWins = match.bestOf === 5 ? 3 : 2 // MD5 precisa 3 vitórias, MD3 precisa 2

  const handleSubmit = () => {
    const s1 = Number.parseInt(score1) || 0
    const s2 = Number.parseInt(score2) || 0

    // Validar se alguém atingiu o número de vitórias necessário
    if (s1 < maxWins && s2 < maxWins) {
      alert(`MD${match.bestOf}: Um time precisa atingir ${maxWins} vitórias`)
      return
    }

    if (s1 >= maxWins && s2 >= maxWins) {
      alert("Apenas um time pode vencer!")
      return
    }

    onResult(s1, s2)
    setSubmitted(true)
  }

  const canSubmit = match.team1 && match.team2 && !submitted

  return (
    <Card className={`p-4 ${isFinal ? "glow-accent border-accent" : "glow-border"}`}>
      <div className="text-center text-xs text-muted-foreground mb-3 font-medium">
        MD{match.bestOf} (Melhor de {match.bestOf})
      </div>

      {/* Team 1 */}
      <div
        className={`p-3 rounded-lg mb-2 transition-all ${
          match.winner?.id === match.team1?.id
            ? "bg-accent/20 border border-accent shadow-lg shadow-accent/20"
            : "bg-background border border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`font-medium ${!match.team1 && "text-muted-foreground"}`}>{match.team1?.name || "TBD"}</span>
          {canSubmit && (
            <Input
              type="number"
              min="0"
              max={maxWins}
              placeholder="0"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className="w-16 text-center bg-background"
            />
          )}
          {submitted && (
            <span
              className={`text-xl font-bold ${match.winner?.id === match.team1?.id ? "text-accent" : "text-primary"}`}
            >
              {match.score1}
            </span>
          )}
        </div>
      </div>

      {/* Team 2 */}
      <div
        className={`p-3 rounded-lg mb-3 transition-all ${
          match.winner?.id === match.team2?.id
            ? "bg-accent/20 border border-accent shadow-lg shadow-accent/20"
            : "bg-background border border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`font-medium ${!match.team2 && "text-muted-foreground"}`}>{match.team2?.name || "TBD"}</span>
          {canSubmit && (
            <Input
              type="number"
              min="0"
              max={maxWins}
              placeholder="0"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              className="w-16 text-center bg-background"
            />
          )}
          {submitted && (
            <span
              className={`text-xl font-bold ${match.winner?.id === match.team2?.id ? "text-accent" : "text-primary"}`}
            >
              {match.score2}
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {canSubmit && (
        <Button onClick={handleSubmit} disabled={!score1 || !score2} size="sm" className="w-full">
          Registrar Resultado
        </Button>
      )}

      {/* Winner Display */}
      {match.winner && (
        <div className="text-center text-sm font-medium text-accent mt-2 flex items-center justify-center gap-2">
          <Trophy className="h-4 w-4" />
          Vencedor: {match.winner.name}
        </div>
      )}
    </Card>
  )
}
