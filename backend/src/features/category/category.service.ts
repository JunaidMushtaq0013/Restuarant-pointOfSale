import { Category } from "./category.model.js";
import { CategoryType } from "./category.types.js";

export const createCategoryService = async (payload: CategoryType) => {
  return await Category.create(payload);
};

export const getAllCategoriesService = async () => {
  return await Category.find({ isActive: true }).sort({
    createdAt: -1,
  });
};

export const getCategoryByIdService = async (id: string) => {
  return await Category.findById(id);
};

export const updateCategoryService = async (
  id: string,
  payload: Partial<CategoryType>
) => {
  return await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteCategoryService = async (id: string) => {
  return await Category.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
    }
  );
};