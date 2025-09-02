import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { TrendingUp, Users, Music, Clock } from "lucide-react";

const mockPlaybackHistory = [
  {
    id: "1",
    user: "João Silva",
    email: "user1@test.com",
    audio: "Meditação Matinal",
    duration: "15:32",
    completedDuration: "15:32",
    completionRate: 100,
    playedAt: "2024-01-15 08:30",
    transcriptionSaved: true
  },
  {
    id: "2",
    user: "Maria Santos", 
    email: "user2@test.com",
    audio: "Foco e Concentração",
    duration: "22:15",
    completedDuration: "18:30",
    completionRate: 83,
    playedAt: "2024-01-15 14:22",
    transcriptionSaved: false
  },
  {
    id: "3",
    user: "João Silva",
    email: "user1@test.com", 
    audio: "Relaxamento Noturno",
    duration: "45:00",
    completedDuration: "12:45",
    completionRate: 28,
    playedAt: "2024-01-14 22:15",
    transcriptionSaved: true
  }
];

const topAudios = [
  { title: "Meditação Matinal", plays: 245, completionRate: 87 },
  { title: "Foco e Concentração", plays: 189, completionRate: 72 },
  { title: "Relaxamento Noturno", plays: 156, completionRate: 45 }
];

export const AdminAnalytics = () => {
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500/10 text-green-500';
    if (rate >= 50) return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-red-500/10 text-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o desempenho e engajamento dos usuários
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reproduções</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">590</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">68%</div>
            <p className="text-xs text-muted-foreground">
              Média de conclusão dos áudios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">24</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">127h</div>
            <p className="text-xs text-muted-foreground">
              Tempo total ouvido
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Audios */}
        <Card>
          <CardHeader>
            <CardTitle>Áudios Mais Populares</CardTitle>
            <CardDescription>
              Ranking dos áudios com mais reproduções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAudios.map((audio, index) => (
                <div key={audio.title} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{audio.title}</div>
                      <div className="text-sm text-muted-foreground">{audio.plays} reproduções</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getCompletionColor(audio.completionRate)}>
                    {audio.completionRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas reproduções de áudios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPlaybackHistory.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{entry.user}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.audio} • {entry.playedAt}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getCompletionColor(entry.completionRate)}>
                      {entry.completionRate}%
                    </Badge>
                    {entry.transcriptionSaved && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        Transcrita
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Playback History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado de Reproduções</CardTitle>
          <CardDescription>
            Registro completo de todas as reproduções de áudios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Áudio</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Completado</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Transcrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlaybackHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{entry.user}</div>
                      <div className="text-sm text-muted-foreground">{entry.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.audio}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>{entry.completedDuration}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCompletionColor(entry.completionRate)}>
                      {entry.completionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{entry.playedAt}</TableCell>
                  <TableCell>
                    {entry.transcriptionSaved ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Salva
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                        Não salva
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};