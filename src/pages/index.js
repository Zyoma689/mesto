import './index.css';
import Card from '../components/Card.js';
import FormValidator from "../components/FormValidator.js";
import Section from '../components/Section.js';
import PopupWithImage from "../components/PopupWithImage.js";
import PopupWithForm from "../components/PopupWithForm.js";
import PopupWithConfirmButton from "../components/PopupWithConfirmButton.js";
import UserInfo from "../components/UserInfo.js";
import Api from "../components/Api.js";
import {
    profileName,
    profileAbout,
    changeAvatarButton,
    avatar,
    editProfileButton,
    editProfilePopup,
    nameInput,
    aboutInput,
    addCardButton,
    addCardPopup,
    changeAvatarPopup,
    confirmPopup,
    cardListSelector,
    imagePopup,
    validationConfig
} from '../utils/constants.js'

// Создаем экземпляр класса Api
const api = new Api({
    baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-19',
    headers: {
        authorization: 'ee997593-23fa-4bcc-b338-c6e6a2cbbaea',
        'Content-Type': 'application/json'
    }
});

// Создаем экземпляр класса UserInfo
const user = new UserInfo({
    nameUserElement: profileName,
    aboutUserElement: profileAbout,
    avatarElement: avatar
});

// Получаем с сервера информацию о пользователе и список карточек
Promise.all([api.getUserData(), api.getInitialCards()])
    .then((values) => {
        const [userData, initialCards] = values;
        user.getUserInfo(userData);
        user.setUserInfo(userData);
        cardsList.renderItems(initialCards, userData);
    })
    .catch((err) => {
        console.log(err)
    });

// Функция, создающая новый экземпляр класса Card и возвращающая DOM-элемент карточки
const createCardElement = (item, userData) => {
    const card = new Card(item, userData, '#card-template',
        {
        handleCardClick: () => {
            popupWithImage.open(card);
        }
    }, {
        handleDeleteButtonClick: () => {
            popupWithConfirmButton.open();
            popupWithConfirmButton.submitHandler(() => {
                api.deleteCard(item)
                    .then(() => {
                        card.delete();
                        popupWithConfirmButton.close();
                    })
            })

        }
    }, {
        handleLikeButtonClick: () => {
            if (card.isLiked()) {
                api.removeLike(card)
                    .then((res) => {
                        card.getLikesInfo(res);
                        card.unsetLike();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                api.addLike(card)
                    .then((res) => {
                        card.getLikesInfo(res);
                        card.setLike();
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        }
    });
    return card.createCard();
};

// Создаем экземпляр класса Section
const cardsList = new Section({
    renderer: (item, userData) => {
        cardsList.addItem(createCardElement(item, userData), true);
    }
}, cardListSelector);

// Создаем экземпляр класса PopupWithImage
const popupWithImage = new PopupWithImage(imagePopup);

// Создаем экземпляр класса PopupWithForm с формой для редактирования профиля
const popupWithEditProfileForm = new PopupWithForm(editProfilePopup, {
    submitHandler: (inputValues) => {
        popupWithEditProfileForm.renderLoading(true, 'Сохранение...');
        api.editUserData({ name: inputValues['nameInput'], about: inputValues['aboutInput']})
            .then((data) => {
                user.setUserInfo(data);
                popupWithEditProfileForm.close();
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                popupWithEditProfileForm.renderLoading(false, 'Сохранить');
            });
    }
});

// Создаем экземпляр класса PopupWithForm с формой для добавления новой карточки
const popupWithAddCardForm = new PopupWithForm(addCardPopup, {
    submitHandler: (inputValues) => {
        popupWithAddCardForm.renderLoading(true, 'Создание...');
        api.postNewCard({ name: inputValues['placeInput'], link: inputValues['linkInput']})
            .then((item) => {
                cardsList.addItem(createCardElement(item, item.owner));
                popupWithAddCardForm.close();
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                popupWithAddCardForm.renderLoading(false, 'Создать');
            });
    }
});

// Создаем экземпляр класса PopupWithForm с формой для изменения пользовательского аватара
const popupWithChangeAvatarForm = new PopupWithForm(changeAvatarPopup, {
    submitHandler: (inputValue) => {
        popupWithChangeAvatarForm.renderLoading(true, 'Сохранение...');
        api.changeUserAvatar({ avatar: inputValue['avatarLinkInput'] })
            .then((res) => {
                user.setUserInfo(res);
                popupWithChangeAvatarForm.close();
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                popupWithChangeAvatarForm.renderLoading(false, 'Сохранить');
            });
    }
});

// Создаем экземпляр класса PopupWithConfirmButton с кнопкой для подтверджения удаления карточки
const popupWithConfirmButton = new PopupWithConfirmButton(confirmPopup);

// Обработчик открытия попапа с формой редактирования профиля
editProfileButton.addEventListener('click', () => {
    user.inputUserInfo(nameInput, aboutInput);
    validateEditProfileForm.hideValidationErrors();
    popupWithEditProfileForm.open();
});

// Обработчик открытия попапа с формой добавления новой карточки
addCardButton.addEventListener('click', () => {
    validateAddCardForm.hideValidationErrors();
    validateAddCardForm.disableButton();
    popupWithAddCardForm.open();
});

// Обработчик открытия попапа с формой изменения пользовательского аватара
changeAvatarButton.addEventListener('click', () => {
    validateChangeAvatarForm.hideValidationErrors();
    validateChangeAvatarForm.disableButton();
    popupWithChangeAvatarForm.open();
});

// Создаем эклемпляр класса FormValidator для формы редактирования профиля
const validateEditProfileForm = new FormValidator(validationConfig, document.querySelector('[name= "editForm"]'));
// Создаем эклемпляр класса FormValidator для формы добавления карточки
const validateAddCardForm = new FormValidator(validationConfig, document.querySelector('[name="addCardForm"]'));
// Создаем эклемпляр класса FormValidator для формы изменения пользовательского аватара
const validateChangeAvatarForm = new FormValidator(validationConfig, document.querySelector('[name="changeAvatarForm"]'));

// Устанавливаем слушатели на все попапы
popupWithImage.setEventListeners();
popupWithAddCardForm.setEventListeners();
popupWithEditProfileForm.setEventListeners();
popupWithChangeAvatarForm.setEventListeners();
popupWithConfirmButton.setEventListeners();
// Включаем валидацию для формы редактирования профиля
validateEditProfileForm.enableValidation();
// Включаем валидацию для формы добавления карточки
validateAddCardForm.enableValidation();
// Включаем валидацию для формы изменения пользовательского аватара
validateChangeAvatarForm.enableValidation();