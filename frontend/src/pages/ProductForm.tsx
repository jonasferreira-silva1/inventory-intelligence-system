import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productsApi, CreateProductData } from '../api/products';
import { categoriesApi } from '../api/categories';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  categoryId: z.string().uuid('Selecione uma categoria'),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  costPrice: z.number().positive('Preço de custo deve ser positivo'),
  salePrice: z.number().positive('Preço de venda deve ser positivo'),
}).refine((data) => data.salePrice >= data.costPrice, {
  message: 'Preço de venda deve ser maior ou igual ao preço de custo',
  path: ['salePrice'],
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      quantity: 0,
      minQuantity: 0,
    },
  });

  const costPrice = watch('costPrice');
  const salePrice = watch('salePrice');

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProduct = async () => {
    try {
      const product = await productsApi.getById(id!);
      setValue('name', product.name);
      setValue('code', product.code);
      setValue('categoryId', product.categoryId);
      setValue('quantity', product.quantity);
      setValue('minQuantity', product.minQuantity);
      setValue('costPrice', product.costPrice);
      setValue('salePrice', product.salePrice);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    }
  };

  const calculateMargin = () => {
    if (!costPrice || !salePrice || salePrice === 0) return 0;
    return ((salePrice - costPrice) / salePrice) * 100;
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      setError('');
      if (isEdit) {
        await productsApi.update(id!, data);
      } else {
        await productsApi.create(data);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/products" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Atualize as informações do produto' : 'Cadastre um novo produto no estoque'}
          </p>
        </div>
      </div>

      <div className="card max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                {...register('name')}
                className="input"
                placeholder="Ex: Notebook Dell"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                {...register('code')}
                className="input"
                placeholder="Ex: PROD-001"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select {...register('categoryId')} className="input">
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                className="input"
                min="0"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                {...register('minQuantity', { valueAsNumber: true })}
                className="input"
                min="0"
              />
              {errors.minQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.minQuantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('costPrice', { valueAsNumber: true })}
                className="input"
                placeholder="0.00"
              />
              {errors.costPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.costPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('salePrice', { valueAsNumber: true })}
                className="input"
                placeholder="0.00"
              />
              {errors.salePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.salePrice.message}</p>
              )}
            </div>
          </div>

          {/* Cálculo de Margem */}
          {costPrice && salePrice && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Margem de Lucro:</span>
                <span className={`text-lg font-bold ${calculateMargin() > 50 ? 'text-green-600' : 'text-gray-900'}`}>
                  {calculateMargin().toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Lucro por unidade: R$ {(salePrice - costPrice).toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Cadastrar'}
            </button>
            <Link to="/products" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

