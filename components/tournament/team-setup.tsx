"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Play, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { Team } from "@/types/tournament"

interface TeamSetupProps {
  onStart: (teams: Team[]) => void
}

export default function TeamSetup({ onStart }: TeamSetupProps) {
  const [teamName, setTeamName] = useState("")
  const [teams, setTeams] = useState<Team[]>([])

  const handleAddTeam = () => {
    if (teamName.trim() && teams.length < 16) {
      setTeams([...teams, { id: crypto.randomUUID(), name: teamName.trim() }])
      setTeamName("")
    }
  }

  const handleRemoveTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTeam()
    }
  }

  const canStart = teams.length >= 8

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <Card className="p-8 md:p-12 text-center glow-border bg-gradient-to-br from-card to-card/50">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Users className="h-16 w-16 text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/40 animate-pulse-glow" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Configure seu Torneio</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Adicione os times participantes (mínimo 8) para começar a competição mais épica do e-sports
        </p>
      </Card>

      {/* Team Input */}
      <Card className="p-6 glow-border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Adicionar Times
        </h3>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Nome do time..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-background border-border focus:border-primary transition-colors"
            maxLength={30}
          />
          <Button
            onClick={handleAddTeam}
            disabled={!teamName.trim() || teams.length >= 16}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{teams.length}/16 times adicionados (mínimo: 8)</p>
      </Card>

      {/* Teams List */}
      {teams.length > 0 && (
        <Card className="p-6 glow-border">
          <h3 className="text-xl font-bold mb-4">Times Cadastrados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{team.name}</span>
                </div>
                <Button
                  onClick={() => handleRemoveTeam(team.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Validation Message */}
      {teams.length > 0 && !canStart && (
        <Card className="p-4 bg-destructive/10 border-destructive/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Configuração inválida</p>
              <p className="text-sm text-destructive/80 mt-1">
                Adicione pelo menos {8 - teams.length} time(s) para iniciar o torneio.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => onStart(teams)}
          disabled={!canStart}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 gap-3 glow-primary disabled:opacity-50 disabled:shadow-none"
        >
          <Play className="h-6 w-6" />
          Iniciar Torneio
        </Button>
      </div>
    </div>
  )
}
