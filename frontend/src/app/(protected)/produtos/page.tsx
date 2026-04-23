'use client'

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  FlexContainer,
  Icon,
  InputText,
  InputTextarea,
} from "@uigovpe/components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { productsService, Product } from "../../../services/products.service";
import { categoriesService, Category } from "../../../services/categories.service";
import { authService } from "../../../services/auth.service";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Esquema de validação
const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Paginação e Filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", categoryIds: [] },
  });

  const loadData = async (page = 1, onlyMine = showOnlyMine) => {
    setIsLoading(true);
    try {
      const user = authService.getStoredUser();
      setCurrentUserId(user?.id || null);
      setUserRole(user?.role || null);

      const params = {
        page,
        limit: 8,
        ...(onlyMine && user?.id ? { ownerId: user.id } : {})
      };

      const [productsResponse, categoriesData] = await Promise.all([
        productsService.findAll(params),
        categoriesService.findAll()
      ]);

      setProducts(productsResponse.data);
      setTotalPages(productsResponse.meta.totalPages);
      setCurrentPage(productsResponse.meta.page);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleFavorite = async (product: Product) => {
    if (product.ownerId === currentUserId) return alert("Você não pode favoritar seu próprio produto.");
    try {
      await productsService.favorite(product.id);
      alert("Favoritado com sucesso!");
    } catch (e) { alert("Erro ao favoritar."); }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.categoryIds) formData.append("categoryIds", JSON.stringify(data.categoryIds));
      if (selectedFile) formData.append("file", selectedFile);

      if (editingProduct) await productsService.update(editingProduct.id, formData);
      else await productsService.create(formData);

      setIsDialogVisible(false);
      loadData(currentPage);
    } catch (e) { alert("Erro ao salvar."); } finally { setIsSaving(false); }
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    setEditingProduct(null);
    reset({ name: "", description: "", categoryIds: [] });
    setSelectedFile(null);
  };

  return (
    <div className="w-full pb-40"> {/* pb-40 para garantir que o fim da lista apareça */}
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#28272C]">Produtos</h1>
            <p className="text-sm text-[#494C57]">Gerencie o catálogo institucional.</p>
          </div>
          <button
            onClick={() => { setShowOnlyMine(!showOnlyMine); loadData(1, !showOnlyMine); }}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition ${showOnlyMine ? "bg-[#0034B7] text-white" : "bg-white border border-gray-300 text-gray-700"}`}
          >
            <Icon icon={showOnlyMine ? "person" : "group"} />
            {showOnlyMine ? "Meus Produtos" : "Todos os Produtos"}
          </button>
        </header>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 px-1">
          {products.map((product) => {

            // 🔐 REGRA DE NEGÓCIO (autorização)
            const canManage = currentUserId === product.ownerId || userRole === 'ADMIN';

            // 🖼️ REGRA DE APRESENTAÇÃO (fallback de imagem)
            const imageUrl = product.imageUrl
              ? `${apiBaseUrl}/files/image?path=${encodeURIComponent(product.imageUrl)}`
              : "/default-product.png";

            return (

              // 🧱 COMPONENTE RAIZ DO CARD
              <article
                key={product.id}
                className="group overflow-hidden rounded-[24px] border border-[#DDE3EC] bg-[#F8FAFC] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >

                {/* 📦 WRAPPER PRINCIPAL (afastamento interno do card inteiro) */}
                <div className="p-5 flex flex-col gap-5">

                  {/* 🔳 WRAPPER SUPERIOR (IMAGEM) */}
                  <div className="flex flex-col">

                    {/* 🖼️ CONTAINER DA IMAGEM */}
                    <div className=" aspect-square max-h-[360px] mx-auto overflow-hidden rounded-[18px] border border-[#DCE3EE] bg-white">

                      {/* 📐 AREA RESPONSIVA */}
                      <div className="aspect-square bg-[#EEF2F7]">

                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default-product.png";
                          }}
                        />

                      </div>
                    </div>
                  </div>

                  {/* 🔻 WRAPPER INFERIOR (TEXTO + RODAPÉ) */}
                  <div className="flex flex-col justify-between gap-4 flex-1">

                    {/* 📝 BLOCO DE INFORMAÇÕES TEXTUAIS */}
                    <div className="min-w-0">

                      {/* 🏷️ NOME DO PRODUTO */}
                      <h2 className="truncate text-[1.2rem] font-bold leading-snug text-[#28272C]">
                        {product.name}
                      </h2>

                      {/* 📄 DESCRIÇÃO */}
                      <p className="mt-3 line-clamp-4 text-[0.9rem] leading-6 text-[#494C57]">
                        {product.description || "Sem descrição."}
                      </p>

                    </div>

                    {/* ⚙️ RODAPÉ DO CARD */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">

                      {/* ❤️ FAVORITAR (AGORA À ESQUERDA) */}
                      <button
                        onClick={() => handleFavorite(product)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5DCE8] bg-white text-[#28272C] shadow-sm hover:text-red-500 transition-colors"
                      >
                        <Icon icon="favorite" />
                      </button>

                      {/* 🏷️ CATEGORIAS (lado a lado, sem sobreposição) */}
                      <div className="flex gap-2 flex-wrap flex-1 justify-center">

                        {product.categories?.length ? (
                          product.categories.map((c) => (
                            <span
                              key={c.category.id}
                              className="whitespace-nowrap rounded-full border border-[#D9E5FF] bg-[#EEF4FF] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0034B7]"
                            >
                              {c.category.name}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-[#D9E5FF] bg-[#EEF4FF] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0034B7]">
                            Geral
                          </span>
                        )}

                      </div>

                      {/* 🧰 AÇÕES (EDITAR + DELETAR) */}
                      <div className="flex gap-2">

                        {canManage && (
                          <>
                            {/* ✏️ EDITAR */}
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                reset({
                                  name: product.name,
                                  description: product.description || "",
                                  categoryIds: product.categories.map(c => c.category.id)
                                });
                                setIsDialogVisible(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                            >
                              <Icon icon="edit" />
                            </button>

                            {/* 🗑️ DELETAR */}
                            <button
                              onClick={() =>
                                productsService
                                  .remove(product.id)
                                  .then(() => loadData(currentPage))
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F2CACA] bg-white text-[#B42318] hover:bg-[#FFF1F1]"
                            >
                              <Icon icon="delete" />
                            </button>
                          </>
                        )}

                      </div>

                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Paginação Centralizada */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-6">
            <Button label="Anterior" severity="secondary" disabled={currentPage === 1} onClick={() => loadData(currentPage - 1)} />
            <span className="text-sm font-bold text-[#494C57]">Página {currentPage} de {totalPages}</span>
            <Button label="Próxima" severity="secondary" disabled={currentPage === totalPages} onClick={() => loadData(currentPage + 1)} />
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 🎯 VARIAÇÕES DO BOTÃO FLUTUANTE (ADICIONAR PRODUTO)                 */}
      {/* ================================================================= */}

      {/* 🟢 VARIAÇÃO 1: Inline Styles com Força Bruta (ATIVA POR PADRÃO) */}
      {/* Usa style nativo do React para tentar furar os bloqueios de layout do pai */}
      <button
        type="button"
        onClick={() => { setEditingProduct(null); reset({ name: "", description: "", categoryIds: [] }); setIsDialogVisible(true); }}
        style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 999999 }}
        // 👇 Usando a sintaxe [valor] para forçar o tamanho exato em pixels
        className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#BCC9E0] text-white shadow-2xl transition hover:scale-105 active:scale-95"
      >
        <Icon icon="add" className="text-[200px] text-white" />
      </button>

      {/* 🔴 VARIAÇÃO 2: Sticky Positioning (O Salvador de Layouts Quebrados) */}
      {/* Ele "gruda" na base da tela independente do pai. Geralmente a melhor solução quando o Fixed falha. */}
      {/*
      <div className="sticky bottom-8 flex justify-end w-full pr-8 pointer-events-none">
        <button
          type="button"
          onClick={() => { setEditingProduct(null); reset({ name: "", description: "", categoryIds: [] }); setIsDialogVisible(true); }}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0034B7] text-white shadow-2xl transition hover:scale-110 active:scale-95"
        >
          <Icon icon="add" className="text-3xl" />
        </button>
      </div>
      */}

      {/* 🟡 VARIAÇÃO 3: Fixed ancorado pelo TOPO usando Viewport Height (vh) e (vw) */}
      {/* Em vez de usar bottom-8, ele calcula 85% da altura da tela real. */}
      {/*
      <button
        type="button"
        onClick={() => { setEditingProduct(null); reset({ name: "", description: "", categoryIds: [] }); setIsDialogVisible(true); }}
        className="fixed top-[85vh] right-[5vw] z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-[#0034B7] text-white shadow-2xl transition hover:scale-110 active:scale-95"
      >
        <Icon icon="add" className="text-3xl" />
      </button>
      */}

      {/* ⚪ VARIAÇÃO 4: O SEU CÓDIGO ORIGINAL INTACTO */}
      {/* Para caso você queira voltar ao que estava antes. */}
      {/*
      <button
        type="button"
        onClick={() => { setEditingProduct(null); reset({ name: "", description: "", categoryIds: [] }); setIsDialogVisible(true); }}
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#0034B7] text-white shadow-2xl transition hover:scale-110 active:scale-95"
      >
        <Icon icon="add" className="text-3xl" />
      </button>
      */}

      {/* ================================================================= */}

      <Dialog
        header={editingProduct ? "Editar Produto" : "Cadastrar Produto"}
        visible={isDialogVisible}
        onHide={closeDialog}
        style={{ width: "92vw", maxWidth: "460px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FlexContainer direction="col" gap="4">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-[#F8FAFC] p-4">
              <label className="text-sm font-semibold text-[#28272C]">Imagem do produto</label>
              <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                {editingProduct ? "Envie uma nova imagem para substituir a atual." : "Envie um arquivo de imagem para a vitrine."}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-3 block w-full text-xs text-[#494C57] file:mr-3 file:rounded-full file:border-0 file:bg-[#EEF4FF] file:px-4 file:py-2.5 file:font-semibold file:text-[#0034B7]"
              />
            </div>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText {...field} label="Nome *" invalid={!!errors.name} supportText={errors.name?.message} />
              )}
            />

            {/* SELEÇÃO DE CATEGORIAS */}
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Categorias
                  </label>

                  <select
                    multiple
                    value={field.value || []}
                    onChange={(e) => {
                      const selectedValues = Array.from(e.target.selectedOptions).map(
                        (option) => option.value
                      );
                      field.onChange(selectedValues);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea {...field} label="Descrição" rows={3} />
              )}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button label="Cancelar" severity="secondary" onClick={closeDialog} type="button" />
              <Button label="Salvar" type="submit" loading={isSaving} />
            </div>
          </FlexContainer>
        </form>
      </Dialog>
    </div>
  );
}

function setUserRole(arg0: string | null) {
  throw new Error("Function not implemented.");
}
