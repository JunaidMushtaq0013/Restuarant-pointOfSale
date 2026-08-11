import { Category } from "./category.model.js";
import { CategoryType } from "./category.types.js";

export const createCategoryService = async (payload: CategoryType) => {
  return await Category.create(payload);
};

export const getAllCategoriesService = async (
  search?: string,
) => {
  const filter: any = {
    isActive: true,
  };

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  return await Category.find(filter).sort({
    createdAt: -1,
  });
};

export const getAllInactiveCategoriesService = async () => {
  return await Category.find({ isActive: false }).sort({
    createdAt: -1,
  });
};


export const activateCategoryService = async (
  id: string,
) => {
  const category = await Category.findByIdAndUpdate(
    id,
    {
      isActive: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!category) {
    throw new Error("Category not found.");
  }

  return category;
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