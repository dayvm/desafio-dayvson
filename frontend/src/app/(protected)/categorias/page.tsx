'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Column,
  Dialog,
  FlexContainer,
  Icon,
  InputText,
  InputTextarea,
  Menu,
  Search,
  Table,
  Typography,
} from "@uigovpe/components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, categoriesService } from "../../../services/categories.service";

const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

type CategoryTableRow = Category & {
  ownerName: string;
};

export default function CategoriasNovaTabelaPage() {
  const [categories, setCategories] = useState<CategoryTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedRow, setSelectedRow] = useState<CategoryTableRow | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const menuRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  const dialogTitle = useMemo(
    () => (editingCategory ? "Editar Categoria" : "Criar Nova Categoria"),
    [editingCategory],
  );

  const fetchCategories = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const data = await categoriesService.findAll();
      const formattedData = data.map((category) => ({
        ...category,
        ownerName: category.owner?.name || "Desconhecido",
      }));

      setCategories(formattedData);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Erro ao buscar categorias.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || "",
    });
    setFeedback(null);
    setIsDialogVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await categoriesService.remove(id);
      setFeedback({ type: "success", message: "Categoria excluída com sucesso." });
      fetchCategories();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Erro ao excluir categoria.",
      });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, data);
        setFeedback({ type: "success", message: "Categoria atualizada com sucesso." });
      } else {
        await categoriesService.create(data);
        setFeedback({ type: "success", message: "Categoria criada com sucesso." });
      }

      closeDialog();
      fetchCategories();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingCategory ? "Erro ao atualizar categoria." : "Erro ao criar categoria."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    setEditingCategory(null);
    reset({ name: "", description: "" });
  };

  const actionMenuItems = [
    {
      label: "Editar",
      icon: <Icon icon="edit" />,
      command: () => {
        if (selectedRow) {
          handleEdit(selectedRow);
        }
      },
    },
    {
      label: "Excluir",
      icon: <Icon icon="delete" />,
      className: "text-red-600",
      command: () => {
        if (selectedRow) {
          handleDelete(selectedRow.id);
        }
      },
    },
  ];

  const actionBodyTemplate = (rowData: CategoryTableRow) => {
    return (
      <div className="flex justify-center">
        <Button
          icon={<Icon icon="more_vert" />}
          className="p-button-rounded p-button-text border border-gray-300 text-gray-600 hover:bg-gray-100"
          onClick={(event) => {
            setSelectedRow(rowData);

            const syntheticEvent = {
              ...event,
              currentTarget: event.currentTarget || event.target,
            };

            requestAnimationFrame(() => {
              menuRef.current?.toggle(syntheticEvent);
            });
          }}
          aria-controls="popup_menu_categories"
          aria-haspopup
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h3" size="xl" fontWeight="bold">
            Categorias
          </Typography>
          <Typography variant="p" className="text-gray-500">
            Gerencie as categorias dos produtos do sistema.
          </Typography>
        </div>

        <Button
          label="Nova Categoria"
          icon="add"
          onClick={() => {
            setEditingCategory(null);
            reset({ name: "", description: "" });
            setIsDialogVisible(true);
          }}
        />
      </div>

      {feedback ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card>
        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Lista de Categorias
        </h2>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:w-1/2">
            <Search
              label="Buscar categoria"
              placeholder="Ex: Informática ou Nome do responsável"
              value={globalFilter}
              onChange={(event: any) => setGlobalFilter(event.value)}
              showAutocomplete={false}
              className="w-full [&_label]:text-gray-700 [&_input]:border-gray-300 [&_input]:bg-white [&_input]:text-gray-900"
            />
          </div>
        </div>

        <div
          className="
            [&_.p-datatable-thead_th]:border-b!
            [&_.p-datatable-thead_th]:border-gray-200!
            [&_.p-datatable-thead_th]:bg-transparent!
            [&_.p-datatable-thead_th]:text-[#0034B7]
            [&_.p-datatable-tbody_tr]:border-none!
            [&_.p-datatable-tbody_tr]:bg-transparent!
            [&_.p-datatable-tbody_tr]:text-gray-800!
            [&_.p-datatable-tbody_tr:nth-child(even)]:bg-gray-50!
            [&_.p-datatable-tbody_tr:hover]:bg-gray-100!
          "
        >
          <Table
            value={categories}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25]}
            loading={isLoading}
            globalFilter={globalFilter}
            globalFilterFields={["name", "description", "ownerName"]}
            className="w-full"
            emptyMessage="Nenhuma categoria encontrada."
            dataKey="id"
          >
            <Column field="name" header="Nome" sortable />
            <Column field="description" header="Descrição" sortable body={(rowData: CategoryTableRow) => rowData.description || "-"} />
            <Column field="ownerName" header="Criado por" sortable />
            <Column
              header="Ação"
              body={actionBodyTemplate}
              style={{ width: "80px" }}
            />
          </Table>
        </div>

        <Menu
          model={actionMenuItems}
          popup
          popupAlignment="right"
          ref={menuRef}
          id="popup_menu_categories"
        />
      </Card>

      <Dialog
        header={dialogTitle}
        visible={isDialogVisible}
        onHide={closeDialog}
        style={{ width: "450px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FlexContainer direction="col" gap="4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  label="Nome da Categoria *"
                  placeholder="Ex: Eletrônicos"
                  invalid={!!errors.name}
                  supportText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  {...field}
                  label="Descrição (Opcional)"
                  placeholder="Detalhes sobre a categoria..."
                  rows={4}
                />
              )}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button label="Cancelar" severity="secondary" onClick={closeDialog} type="button" />
              <Button
                label={editingCategory ? "Salvar Alterações" : "Salvar Categoria"}
                type="submit"
                loading={isSaving}
              />
            </div>
          </FlexContainer>
        </form>
      </Dialog>
    </div>
  );
}
