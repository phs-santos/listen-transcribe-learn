import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Dispatch, SetStateAction } from "react";

export type ConfirmState =
    | { open: false }
    | {
          open: true;
          kind: "list" | "audio";
          id: number;
          title: string;
          parentListId?: number;
      };

export default function AlertExclusao({
    confirm,
    setConfirm,
    onConfirmDelete,
}: {
    confirm: ConfirmState;
    setConfirm: Dispatch<SetStateAction<ConfirmState>>;
    onConfirmDelete: () => Promise<void> | void;
}) {
    return (
        <AlertDialog
            open={confirm.open}
            onOpenChange={(open) => !open && setConfirm({ open: false })}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {confirm.open && confirm.kind === "list"
                            ? "Excluir lista?"
                            : "Remover áudio?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {confirm.open && (
                            <>
                                Tem certeza que deseja{" "}
                                <span className="font-medium">
                                    {confirm.kind === "list"
                                        ? "excluir a lista"
                                        : "remover o áudio"}
                                </span>{" "}
                                <span className="font-medium">
                                    “{confirm.title}”
                                </span>
                                ?
                                {confirm.kind === "list"
                                    ? " Esta ação não pode ser desfeita."
                                    : ""}
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={() => setConfirm({ open: false })}
                    >
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={async () => {
                            await onConfirmDelete(); // ✅ executa
                            setConfirm({ open: false }); // ✅ fecha
                        }}
                    >
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
