import type { Dispatch, SetStateAction } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ListMusic, Trash2, Edit } from "lucide-react";
import { useAudioLists, type AudioList } from "@/hooks/use-audio-lists";

export default function ListCard({
    list,
    setSelectedList,
    onConfirmDeleteList,
    onEditList,
}: {
    list: AudioList;
    setSelectedList: Dispatch<SetStateAction<AudioList | null>>;
    onConfirmDeleteList: (list: AudioList) => Promise<void> | void;
    onEditList: (list: AudioList) => void;
}) {
    const { getById } = useAudioLists();

    function formatDatetime(str?: string) {
        if (!str) return "—";
        const d = new Date(str);
        if (isNaN(d.getTime())) return "—";
        return `${d.toLocaleDateString("pt-BR")} ${d
            .toTimeString()
            .slice(0, 5)}`;
    }

    return (
        <Card className="group relative flex flex-col overflow-hidden border-border/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
            {/* Accent gradient */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/70 opacity-80" />
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center ring-1 ring-border/60 transition group-hover:scale-105">
                    <ListMusic className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                        {list.notes || "Sem notas"}
                    </CardTitle>
                    <CardDescription className="flex flex-col truncate">
                        <span className="truncate">{list.accountcode}</span>
                        <span className="truncate">
                            {formatDatetime(list.start_date)} →{" "}
                            {formatDatetime(list.end_date)}
                        </span>
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                        {list.status}
                    </Badge>
                    {typeof list.totalAudios === "number" && (
                        <Badge variant="secondary" className="rounded-full">
                            {list.totalAudios} áudios
                        </Badge>
                    )}
                </div>

                {/* Actions bottom-right */}
                <div className="mt-auto flex gap-2 justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedList(list)}
                        className="shadow-sm"
                    >
                        Abrir
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditList(list)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Excluir lista?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir{" "}
                                    <span className="font-medium">
                                        {list.notes || list.accountcode}
                                    </span>
                                    ? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => onConfirmDeleteList(list)}
                                >
                                    Confirmar exclusão
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
