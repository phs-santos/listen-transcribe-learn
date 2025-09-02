import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Upload, Edit, Trash2, MoreHorizontal, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockAudios = [
  {
    id: "1",
    title: "Meditação Matinal",
    description: "Uma sessão relaxante para começar o dia",
    duration: "15:32",
    category: "Meditação",
    status: "published",
    plays: 245,
    likes: 32,
    uploadedBy: "admin@test.com",
    uploadedAt: "2024-01-10",
    fileSize: "12.5 MB"
  },
  {
    id: "2",
    title: "Foco e Concentração", 
    description: "Técnicas para melhorar o foco no trabalho",
    duration: "22:15",
    category: "Produtividade",
    status: "published",
    plays: 189,
    likes: 28,
    uploadedBy: "admin@test.com", 
    uploadedAt: "2024-01-08",
    fileSize: "18.2 MB"
  },
  {
    id: "3",
    title: "Relaxamento Noturno",
    description: "Sons para uma noite tranquila de sono",
    duration: "45:00", 
    category: "Sono",
    status: "draft",
    plays: 0,
    likes: 0,
    uploadedBy: "admin@test.com",
    uploadedAt: "2024-01-15",
    fileSize: "35.8 MB"
  }
];

export const AdminAudios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [audios] = useState(mockAudios);

  const filteredAudios = audios.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'meditação': return 'bg-purple-500/10 text-purple-500';
      case 'produtividade': return 'bg-blue-500/10 text-blue-500';
      case 'sono': return 'bg-indigo-500/10 text-indigo-500';
      default: return 'bg-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-500/10 text-green-500' 
      : 'bg-yellow-500/10 text-yellow-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Áudios</h1>
          <p className="text-muted-foreground mt-2">
            Adicione, edite e gerencie todos os áudios da plataforma
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Novo Áudio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {audios.length}
            </CardTitle>
            <CardDescription>Total de Áudios</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {audios.filter(a => a.status === 'published').length}
            </CardTitle>
            <CardDescription>Publicados</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {audios.reduce((acc, audio) => acc + audio.plays, 0)}
            </CardTitle>
            <CardDescription>Total de Reproduções</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {audios.reduce((acc, audio) => acc + audio.likes, 0)}
            </CardTitle>
            <CardDescription>Total de Likes</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar áudios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Audios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Áudios</CardTitle>
          <CardDescription>
            Lista completa de áudios disponíveis na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reproduções</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data Upload</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudios.map((audio) => (
                <TableRow key={audio.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{audio.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {audio.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(audio.category)}>
                      {audio.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{audio.duration}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(audio.status)}>
                      {audio.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{audio.plays}</TableCell>
                  <TableCell>{audio.likes}</TableCell>
                  <TableCell className="text-muted-foreground">{audio.fileSize}</TableCell>
                  <TableCell className="text-muted-foreground">{audio.uploadedAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Reproduzir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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