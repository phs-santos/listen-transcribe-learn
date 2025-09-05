import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart3,
    FileText,
    Users,
    Download,
    Search,
    Eye,
    Calendar,
    Clock,
} from "lucide-react";
import { TranscriptionModal } from "@/components/admin/TranscriptionModal";
import { toast } from "@/hooks/use-toast";
import { useAudioLists } from "@/hooks/use-audio-lists";

// Mock data para transcrições
const mockTranscriptions = [
    {
        id: 1,
        audioTitle: "Reunião de Equipe - Janeiro",
        userEmail: "user1@test.com",
        transcribedAt: "2024-01-15T10:30:00Z",
        duration: "45:32",
        humanTranscription:
            "Esta é uma reunião importante sobre os objetivos do primeiro trimestre. Discutimos as metas de vendas, desenvolvimento de produtos e estratégias de marketing. O equipe deve focar em aumentar a produtividade em 20% e melhorar a satisfação do cliente.",
        aiTranscription:
            "Esta reunião importante sobre objetivos primeiro trimestre. Discutimos metas vendas desenvolvimento produtos estratégias marketing. Equipe deve focar aumentar produtividade 20% melhorar satisfação cliente.",
    },
    {
        id: 2,
        audioTitle: "Entrevista com Cliente",
        userEmail: "user2@test.com",
        transcribedAt: "2024-01-16T14:20:00Z",
        duration: "28:15",
        humanTranscription:
            "O cliente demonstrou grande satisfação com o produto atual. Sugeriu melhorias na interface do usuário e solicitou novas funcionalidades para o próximo trimestre. Feedback muito positivo sobre o suporte técnico.",
        aiTranscription:
            "Cliente demonstrou satisfação produto atual. Sugeriu melhorias interface usuário solicitou novas funcionalidades próximo trimestre. Feedback positivo suporte técnico.",
    },
    {
        id: 3,
        audioTitle: "Palestra - IA no Futuro",
        userEmail: "admin@test.com",
        transcribedAt: "2024-01-17T09:15:00Z",
        duration: "1:12:08",
        humanTranscription:
            "A inteligência artificial está transformando todas as indústrias. Vemos aplicações em saúde, educação, finanças e tecnologia. É importante preparar nossa equipe para essas mudanças e investir em treinamento adequado.",
    },
    {
        id: 4,
        audioTitle: "Brainstorm Criativo",
        userEmail: "user1@test.com",
        transcribedAt: "2024-01-18T16:45:00Z",
        duration: "38:56",
        aiTranscription:
            "Sessão criativa gerou muitas ideias inovadoras. Focamos campanhas digitais, estratégias redes sociais, parcerias influenciadores. Próximos passos incluem pesquisa mercado validação conceitos.",
    },
    {
        id: 5,
        audioTitle: "Aula Online - Marketing",
        userEmail: "user2@test.com",
        transcribedAt: "2024-01-19T11:30:00Z",
        duration: "52:18",
        humanTranscription:
            "Marketing digital para startups requer estratégia bem definida. Focar em SEO, content marketing, redes sociais e email marketing. Métricas importantes incluem CTR, conversão e LTV do cliente.",
        aiTranscription:
            "Marketing digital startups requer estratégia definida. Focar SEO content marketing redes sociais email marketing. Métricas importantes CTR conversão LTV cliente.",
    },
];

export const AdminAnalytics = () => {
    const {
        audiosTranscribed,
        loadingAT: loading,
        listAudiosTranscribed,
    } = useAudioLists();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTranscription, setSelectedTranscription] = useState<
        (typeof audiosTranscribed)[0] | null
    >(null);

    useEffect(() => {
        listAudiosTranscribed();
    }, [listAudiosTranscribed]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredTranscriptions = audiosTranscribed.filter(
        (transcription) =>
            transcription.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            transcription.transcriber.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalTranscriptions: audiosTranscribed.length,
        totalUsers: new Set(
            audiosTranscribed.map((t) => t.transcriber?.email).filter(Boolean)
        ).size,
        totalDuration: audiosTranscribed.reduce((acc, t) => {
            return acc + (t.duration || 0) / 60;
        }, 0),
        avgPerUser: (() => {
            const userCount = new Set(
                audiosTranscribed
                    .map((t) => t.transcriber?.email)
                    .filter(Boolean)
            ).size;
            return userCount > 0 ? audiosTranscribed.length / userCount : 0;
        })(),
    };

    const viewTranscription = (
        transcription: (typeof audiosTranscribed)[0]
    ) => {
        setSelectedTranscription(transcription);
        setIsModalOpen(true);
    };

    const exportAllTranscriptions = () => {
        const csvContent = [
            [
                "Título do Áudio",
                "Usuário",
                "Data",
                "Duração",
                "Transcrição Humana",
                "Transcrição IA",
            ].join(","),
            ...audiosTranscribed.map((t) =>
                [
                    `"${t.title}"`,
                    `"${t.transcriber.email}"`,
                    `"${new Date(t.updated_at).toLocaleDateString("pt-BR")}"`,
                    `"${t.duration}"`,
                    `"${t.transcript_human || ""}"`,
                    `"${t.transcript_ai || ""}"`,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transcricoes-${
            new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Sucesso",
            description: "Transcrições exportadas com sucesso!",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Analytics de Transcrições
                    </h1>
                    <p className="text-muted-foreground">
                        Visualize estatísticas e gerencie as transcrições do
                        sistema
                    </p>
                </div>
                <Button
                    onClick={exportAllTranscriptions}
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Exportar Todas
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-card border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total de Transcrições
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {stats.totalTranscriptions}
                            </p>
                        </div>
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-card border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Usuários Ativos
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {stats.totalUsers}
                            </p>
                        </div>
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-card border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Tempo Total
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {Math.round(stats.totalDuration)}h
                            </p>
                        </div>
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-card border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Média por Usuário
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {Math.round(stats.avgPerUser)}
                            </p>
                        </div>
                        <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card className="p-6 bg-gradient-card border-border/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por título ou usuário..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Transcriptions Table */}
                <div className="rounded-md border border-border/50">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título do Áudio</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTranscriptions.length > 0 ? (
                                filteredTranscriptions.map((transcription) => (
                                    <TableRow key={transcription.id}>
                                        <TableCell className="font-medium">
                                            {transcription.title}
                                        </TableCell>
                                        <TableCell>
                                            {transcription.transcriber.name}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                transcription.updated_at
                                            ).toLocaleDateString("pt-BR")}
                                        </TableCell>
                                        <TableCell>
                                            {transcription.duration}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {transcription.transcript_human && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        Humana
                                                    </span>
                                                )}
                                                {transcription.transcript_ai && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        IA
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    viewTranscription(
                                                        transcription
                                                    )
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-8"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                {searchTerm
                                                    ? "Nenhuma transcrição encontrada para sua busca."
                                                    : "Nenhuma transcrição disponível."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Transcription Modal */}
            <TranscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transcription={selectedTranscription}
            />
        </div>
    );
};
