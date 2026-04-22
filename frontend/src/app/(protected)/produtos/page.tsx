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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const productSchema = z.object({
  name: z.string().min(1, "O nome do produto e obrigatorio"),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

function resolveProductImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  return `${apiBaseUrl}/files/image?path=${encodeURIComponent(imageUrl)}`;
}

function getPrimaryCategory(product: Product) {
  return product.categories?.[0]?.name || "Sem categoria";
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "" },
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Passamos a ler o .data de dentro do objeto retornado
      const response = await productsService.findAll();
      setProducts(response.data); 
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      await productsService.remove(id);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao excluir produto.");
    }
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    reset();
    setSelectedFile(null);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await productsService.create(formData);
      closeDialog();
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Erro ao criar produto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-3 px-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#0034B7]/70">
                Catalogo
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#28272C] sm:text-4xl">
                Produtos
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#494C57]">
                Uma vitrine mobile-first com dois produtos por linha, linguagem
                visual mais leve e foco total no card do item.
              </p>
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#0034B7] shadow-sm">
              {products.length} itens
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-[#494C57] shadow-sm">
            Carregando catalogo...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4FF] text-[#0034B7]">
              <Icon icon="inventory_2" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[#28272C]">
              Nenhum produto encontrado
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#494C57]">
              Comece cadastrando o primeiro item da vitrine. A estrutura da
              tela foi pensada para funcionar bem no celular.
            </p>
            <button
              type="button"
              onClick={() => setIsDialogVisible(true)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0034B7] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#002493]"
            >
              Novo produto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 px-1 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const productImageUrl = resolveProductImageUrl(product.imageUrl);

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[28px] border border-[#DDE3EC] bg-[#F8FAFC] shadow-[0_10px_28px_rgba(0,26,122,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,26,122,0.14)]"
                >
                  <div className="p-3 sm:p-4">
                    <div className="relative overflow-hidden rounded-[22px] border border-[#DCE3EE] bg-white">
                      <div className="aspect-square bg-[#EEF2F7]">
                        {productImageUrl ? (
                          <img
                            src={productImageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-medium text-[#6B7280]">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#D5DCE8] bg-white/95 text-[#28272C] shadow-sm">
                        <Icon icon="favorite" />
                      </div>
                    </div>

                    <div className="mt-4 min-w-0">
                      <h2 className="truncate text-[1rem] font-semibold leading-tight text-[#28272C]">
                        {product.name}
                      </h2>

                      <p className="mt-2 line-clamp-3 text-[0.82rem] leading-5 text-[#494C57]">
                        {product.description || "Sem descricao disponivel."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="max-w-[68%] truncate rounded-full border border-[#D9E5FF] bg-[#EEF4FF] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0034B7]">
                        {getPrimaryCategory(product)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F2CACA] bg-white text-[#B42318] transition hover:bg-[#FFF1F1]"
                        aria-label={`Excluir ${product.name}`}
                      >
                        <Icon icon="delete" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => setIsDialogVisible(true)}
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2A8A] text-white shadow-[0_18px_38px_rgba(0,26,122,0.28)] transition hover:scale-[1.03] hover:bg-[#09226F]"
        aria-label="Novo produto"
      >
        <Icon icon="add" className="text-[1.75rem]" />
      </button>

      <Dialog
        header="Cadastrar Produto"
        visible={isDialogVisible}
        onHide={closeDialog}
        style={{ width: "92vw", maxWidth: "460px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FlexContainer direction="col" gap="4">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-[#F8FAFC] p-4">
              <label className="text-sm font-semibold text-[#28272C]">
                Imagem do produto
              </label>
              <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                Envie um arquivo de imagem para aparecer no card da vitrine.
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
                className="mt-3 block w-full text-xs text-[#494C57] file:mr-3 file:rounded-full file:border-0 file:bg-[#EEF4FF] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-[#0034B7]"
              />

              {selectedFile ? (
                <p className="mt-3 truncate text-sm font-medium text-[#28272C]">
                  {selectedFile.name}
                </p>
              ) : null}
            </div>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  label="Nome *"
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
                  label="Descricao"
                  rows={3}
                />
              )}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                label="Cancelar"
                severity="secondary"
                onClick={closeDialog}
                type="button"
              />
              <Button
                label="Salvar"
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
