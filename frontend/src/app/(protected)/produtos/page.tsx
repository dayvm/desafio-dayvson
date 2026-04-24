'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AutoCompleteChangeEvent,
  Button,
  Card,
  Dialog,
  FlexContainer,
  Icon,
  Image,
  InputFile,
  InputSwitch,
  InputText,
  InputTextarea,
  Message,
  MultiSelect,
  MultiSelectChangeEvent,
  Paginator,
  PaginatorPageChangeEvent,
  Search,
  Tag,
  Typography,
} from "@uigovpe/components";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authService } from "../../../services/auth.service";
import { Category, categoriesService } from "../../../services/categories.service";
import { Product, productsService } from "../../../services/products.service";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const defaultProductImage = "/images/default-product.png";
const initialRowsPerPage = 8;

const productSchema = z.object({
  name: z.string().min(1, "O nome do produto e obrigatorio"),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductQueryParams = NonNullable<Parameters<typeof productsService.findAll>[0]> & {
  ownerId?: string;
};
type FeedbackSeverity = "success" | "error" | "info" | "warn";
type Feedback = {
  severity: FeedbackSeverity;
  summary: string;
  text: string;
};
type LoadDataOptions = {
  page?: number;
  onlyMine?: boolean;
  search?: string;
  limit?: number;
  silent?: boolean;
};

function getProductImageUrl(product: Product) {
  if (!product.imageUrl) {
    return defaultProductImage;
  }

  return `${apiBaseUrl}/files/image?path=${encodeURIComponent(product.imageUrl)}`;
}

function getCategoryOptions(categories: Category[]) {
  return categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return fallback;
}

export default function ProdutosUigovpePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const categoryOptions = useMemo(() => getCategoryOptions(categories), [categories]);
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", categoryIds: [] },
  });

  const loadData = useCallback(async ({
    page = 1,
    onlyMine = false,
    search = "",
    limit = initialRowsPerPage,
    silent = false,
  }: LoadDataOptions = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const user = authService.getStoredUser();
      setCurrentUserId(user?.id || null);
      setUserRole(user?.role || null);

      const params: ProductQueryParams = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (onlyMine && user?.id) {
        params.ownerId = user.id;
      }

      const [productsResponse, categoriesData] = await Promise.all([
        productsService.findAll(params),
        categoriesService.findAll(),
      ]);

      setProducts(productsResponse.data);
      setTotalRecords(productsResponse.meta.total);
      setCurrentPage(productsResponse.meta.page);
      setRowsPerPage(productsResponse.meta.limit);
      setCategories(categoriesData);
    } catch (error: unknown) {
      setFeedback({
        severity: "error",
        summary: "Erro ao buscar produtos",
        text: getErrorMessage(error, "Nao foi possivel carregar o catalogo."),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData({ silent: true });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    reset({ name: "", description: "", categoryIds: [] });
    setIsDialogVisible(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setSelectedFile(null);
    reset({
      name: product.name,
      description: product.description || "",
      categoryIds: product.categories?.map((item) => item.category.id) || [],
    });
    setIsDialogVisible(true);
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    setEditingProduct(null);
    setSelectedFile(null);
    reset({ name: "", description: "", categoryIds: [] });
  };

  const handleSearchChange = (event: AutoCompleteChangeEvent) => {
    setSearchValue(String(event.value || ""));
  };

  const handleSearch = (value: unknown) => {
    const nextSearch = typeof value === "string" ? value : searchValue;
    setSearchValue(nextSearch);
    void loadData({ page: 1, onlyMine: showOnlyMine, search: nextSearch, limit: rowsPerPage });
  };

  const handleToggleMine = (checked: boolean) => {
    setShowOnlyMine(checked);
    void loadData({ page: 1, onlyMine: checked, search: searchValue, limit: rowsPerPage });
  };

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    void loadData({
      page: event.page + 1,
      onlyMine: showOnlyMine,
      search: searchValue,
      limit: event.rows,
    });
  };

  const handleFavorite = async (product: Product) => {
    if (product.ownerId === currentUserId) {
      setFeedback({
        severity: "warn",
        summary: "Acao nao permitida",
        text: "Voce nao pode favoritar seu proprio produto.",
      });
      return;
    }

    try {
      await productsService.favorite(product.id);
      setFeedback({
        severity: "success",
        summary: "Produto favoritado",
        text: `${product.name} foi adicionado aos seus favoritos.`,
      });
    } catch (error: unknown) {
      setFeedback({
        severity: "error",
        summary: "Erro ao favoritar",
        text: getErrorMessage(error, "Nao foi possivel favoritar o produto."),
      });
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.categoryIds?.length) {
        formData.append("categoryIds", JSON.stringify(data.categoryIds));
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      if (editingProduct) {
        await productsService.update(editingProduct.id, formData);
      } else {
        await productsService.create(formData);
      }

      setFeedback({
        severity: "success",
        summary: editingProduct ? "Produto atualizado" : "Produto criado",
        text: editingProduct
          ? "As alteracoes foram salvas com sucesso."
          : "O produto foi adicionado ao catalogo.",
      });
      closeDialog();
      void loadData({ page: currentPage, onlyMine: showOnlyMine, search: searchValue, limit: rowsPerPage });
    } catch (error: unknown) {
      setFeedback({
        severity: "error",
        summary: "Erro ao salvar",
        text: getErrorMessage(error, "Nao foi possivel salvar o produto."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      await productsService.remove(deletingProduct.id);
      setFeedback({
        severity: "success",
        summary: "Produto excluido",
        text: `${deletingProduct.name} foi removido do catalogo.`,
      });
      setDeletingProduct(null);
      void loadData({ page: currentPage, onlyMine: showOnlyMine, search: searchValue, limit: rowsPerPage });
    } catch (error: unknown) {
      setFeedback({
        severity: "error",
        summary: "Erro ao excluir",
        text: getErrorMessage(error, "Nao foi possivel excluir o produto."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FlexContainer direction="col" gap="6" className="w-full pb-24">
      <Card elevation="low">
        <FlexContainer direction="row" gap="4" justify="between" align="end" wrap="wrap">
          <FlexContainer direction="col" gap="1">
            <Typography variant="h1" size="xxl" fontWeight="bold">
              Produtos
            </Typography>
            <Typography variant="p" className="text-gray-600">
              Gerencie o catalogo institucional com os componentes do UI GovPE.
            </Typography>
          </FlexContainer>

          <FlexContainer direction="row" gap="3" align="center" wrap="wrap">
            <InputSwitch
              checked={showOnlyMine}
              label="Meus produtos"
              onChange={(event) => handleToggleMine(Boolean(event.value))}
            />
            <Button label="Novo Produto" icon={<Icon icon="add" />} onClick={openCreateDialog} />
          </FlexContainer>
        </FlexContainer>
      </Card>

      <Card elevation="low">
        <FlexContainer direction="row" gap="4" justify="between" align="end" wrap="wrap">
          <FlexContainer direction="col" gap="1">
            <Typography variant="h2" size="lg" fontWeight="bold">
              Vitrine
            </Typography>
            <Typography variant="p" className="text-gray-600">
              {isLoading
                ? "Carregando produtos..."
                : `${totalRecords} produto${totalRecords === 1 ? "" : "s"} encontrado${
                    totalRecords === 1 ? "" : "s"
                  }`}
            </Typography>
          </FlexContainer>

          <div className="w-full md:max-w-md">
            <Search
              label="Buscar produto"
              placeholder="Nome ou descricao"
              value={searchValue}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              showAutocomplete={false}
              showEmptyMessage={false}
            />
          </div>
        </FlexContainer>
      </Card>

      {feedback ? (
        <Message
          severity={feedback.severity}
          summary={feedback.summary}
          text={feedback.text}
          icon={feedback.severity === "success" ? "check_circle" : "warning"}
        />
      ) : null}

      {isLoading ? (
        <Card elevation="low">
          <FlexContainer direction="row" justify="center" align="center" className="min-h-64">
            <Typography variant="p" fontWeight="medium">
              Carregando produtos...
            </Typography>
          </FlexContainer>
        </Card>
      ) : products.length === 0 ? (
        <Card elevation="low">
          <Message
            severity="info"
            summary="Nenhum produto encontrado"
            text="Ajuste a busca, altere o filtro ou cadastre um novo produto."
            icon="info"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {products.map((product) => {
            const canManage = currentUserId === product.ownerId || userRole === "ADMIN";
            const productCategories = product.categories?.length ? product.categories : [];

            return (
              <Card
                key={product.id}
                elevation="medium"
                className="h-full overflow-hidden"
                header={
                  <Image
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="block aspect-square w-full overflow-hidden bg-gray-100"
                    imageClassName="h-full w-full object-cover"
                    imageStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
                    pt={{
                      image: {
                        onError: (event) => {
                          event.currentTarget.src = defaultProductImage;
                        },
                      },
                    }}
                  />
                }
                footer={
                  <FlexContainer direction="row" justify="between" align="center" gap="2" wrap="wrap">
                    <Button
                      rounded
                      outlined
                      severity="secondary"
                      icon={<Icon icon="favorite" />}
                      aria-label={`Favoritar ${product.name}`}
                      onClick={() => handleFavorite(product)}
                    />

                    {canManage ? (
                      <FlexContainer direction="row" gap="2" align="center">
                        <Button
                          rounded
                          outlined
                          severity="secondary"
                          icon={<Icon icon="edit" />}
                          aria-label={`Editar ${product.name}`}
                          onClick={() => openEditDialog(product)}
                        />
                        <Button
                          rounded
                          outlined
                          severity="danger"
                          icon={<Icon icon="delete" />}
                          aria-label={`Excluir ${product.name}`}
                          onClick={() => setDeletingProduct(product)}
                        />
                      </FlexContainer>
                    ) : (
                      <Tag value="Somente leitura" severity="secondary" icon="visibility" />
                    )}
                  </FlexContainer>
                }
              >
                <FlexContainer direction="col" gap="4">
                  <FlexContainer direction="col" gap="2">
                    <Typography variant="h2" size="lg" fontWeight="bold" className="line-clamp-2">
                      {product.name}
                    </Typography>
                    <Typography variant="p" className="line-clamp-4 text-gray-600">
                      {product.description || "Sem descricao."}
                    </Typography>
                  </FlexContainer>

                  <FlexContainer direction="row" gap="2" wrap="wrap">
                    {productCategories.length > 0 ? (
                      productCategories.map((item) => (
                        <Tag
                          key={item.category.id}
                          value={item.category.name}
                          severity="info"
                          icon="category"
                        />
                      ))
                    ) : (
                      <Tag value="Geral" severity="info" icon="category" />
                    )}
                  </FlexContainer>

                  {product.owner?.name ? (
                    <Tag value={product.owner.name} severity="secondary" icon="person" />
                  ) : null}
                </FlexContainer>
              </Card>
            );
          })}
        </div>
      )}

      {totalRecords > rowsPerPage ? (
        <Card elevation="low">
          <Paginator
            first={(currentPage - 1) * rowsPerPage}
            rows={rowsPerPage}
            totalRecords={totalRecords}
            rowsPerPageOptions={[8, 16, 24]}
            showRowsPerPage={false}
            showCurrentPageReport
            centered
            onPageChange={handlePageChange}
          />
          <Typography variant="p" size="small" textAlign="center" className="mt-3 text-gray-600">
            Pagina {currentPage} de {totalPages}
          </Typography>
        </Card>
      ) : null}

      <Dialog
        header={editingProduct ? "Editar Produto" : "Cadastrar Produto"}
        visible={isDialogVisible}
        onHide={closeDialog}
        style={{ width: "92vw", maxWidth: "560px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FlexContainer direction="col" gap="4">
            <InputFile
              label="Imagem do produto"
              accept="image/*"
              placeholder="Selecionar imagem"
              supportText={
                editingProduct
                  ? "Envie uma nova imagem para substituir a atual."
                  : "Formatos aceitos: imagens."
              }
              fileNameAttachment={selectedFile?.name || null}
              success={!!selectedFile}
              onChange={(files) => setSelectedFile(files?.[0] || null)}
              onClear={() => setSelectedFile(null)}
            />

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  label="Nome *"
                  placeholder="Nome do produto"
                  invalid={!!errors.name}
                  supportText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  value={field.value || []}
                  options={categoryOptions}
                  optionLabel="label"
                  optionValue="value"
                  display="chip"
                  filter
                  showClear
                  label="Categorias"
                  placeholder="Selecione uma ou mais categorias"
                  emptyFilterMessage="Nenhuma categoria encontrada."
                  supportText="Use categorias curtas para facilitar a leitura na vitrine."
                  onChange={(event: MultiSelectChangeEvent) => field.onChange(event.value)}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  {...field}
                  label="Descricao"
                  placeholder="Detalhes sobre o produto"
                  rows={4}
                />
              )}
            />

            <FlexContainer direction="row" gap="2" justify="end" wrap="wrap" className="mt-4">
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={closeDialog}
              />
              <Button type="submit" label="Salvar" loading={isSaving} icon={<Icon icon="save" />} />
            </FlexContainer>
          </FlexContainer>
        </form>
      </Dialog>

      <Dialog
        header="Excluir Produto"
        visible={!!deletingProduct}
        onHide={() => setDeletingProduct(null)}
        style={{ width: "92vw", maxWidth: "420px" }}
      >
        <FlexContainer direction="col" gap="4">
          <Message
            severity="warn"
            summary="Confirmar exclusao"
            text={
              deletingProduct
                ? `Deseja excluir ${deletingProduct.name}? Esta acao nao pode ser desfeita.`
                : "Deseja excluir este produto?"
            }
            icon="warning"
          />

          <FlexContainer direction="row" gap="2" justify="end" wrap="wrap">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setDeletingProduct(null)}
            />
            <Button
              type="button"
              label="Excluir"
              severity="danger"
              loading={isDeleting}
              icon={<Icon icon="delete" />}
              onClick={confirmDelete}
            />
          </FlexContainer>
        </FlexContainer>
      </Dialog>
    </FlexContainer>
  );
}
