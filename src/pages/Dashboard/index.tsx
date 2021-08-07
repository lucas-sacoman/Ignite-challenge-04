import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { FoodParams } from '../../types';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const [foods, setFoods] = useState<FoodParams[]>([]);
  const [editingFood, setEditingFood] = useState<FoodParams>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    api
      .get('/foods')
      .then((response) => setFoods(response.data))
      .catch((err) => {
        console.error('ocorreu um erro !' + err);
      })
  }, []);

  async function handleAddFood(food: FoodParams) {
    try {
      const response = await api.post<FoodParams>('/foods', {
        ...food,
        available: true,
      });

      setFoods([
        ...foods,
        response.data
      ]);
    } catch (err) {
      console.error('ocorreu um erro !' + err);
    }
  }

  async function handleUpdateFood(food: FoodParams) {
    if (!editingFood) {
      return;
    }
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood,...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.error('ocorreu um erro !' + err);
    }
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  }

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodParams) {
    setEditingFood(food)
    setEditModalOpen(true)
  }

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};
