"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import re

from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import User, Seller, ReviewProduct
from api.modelsProduct import Product
from sqlalchemy import func
from api.db import db
from .models import TokenBlokedList

# from api.favoritos import Favorito

# from api.recipe import Recipe
from api.modelsProduct import Category

# from api.countries import Country
# from api.likes import Like
from api.utils import generate_sitemap, APIException
from datetime import datetime
from itsdangerous import URLSafeTimedSerializer

from api.extensions import jwt, bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import jwt_required, get_jwt
from flask_jwt_extended import JWTManager

import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# PARA OPERACIONES CON FECHAS Y HORAS.
from datetime import (
    date,
    time,
    datetime,
    timezone,
    timedelta,
)  # timedelta, es para hacer resta de horas.

# LIBRERIA PARA VALIDAR EMAIL, valida que el dominio exista y que tenga un formato valida de email.
from email_validator import validate_email, EmailNotValidError

# PARA MANEJAR LA ENCRIPTACIÓN DE LA INFORMACIÓN. ADICIONAL SE REQUIERE, FLASK, REQUEST, JSONIFY, SIN EMBARGO ESOS YA FUERON INSTALADOS ARRIBA.
from flask_jwt_extended import get_jwt
from flask_jwt_extended import JWTManager

# Configuración de Cloudinary
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    api_proxy="http://proxy.server:9999",
    secure=True,
)

routes_product = Blueprint("routes_product", __name__)

EMAIL = os.environ.get("EMAIL")
PASSWORD = os.environ.get("PASSWORD")


def sendEmail(message, to, subject):
    smtp_address = "smtp.gmail.com"
    smtp_port = 465  # SSL

    print(message, to, subject)

    messageMime = MIMEMultipart("alternative")
    messageMime["Subject"] = subject
    messageMime["To"] = to
    messageMime["From"] = EMAIL

    html = (
        """
    <html>
    <body>
    <h1> Hi, """
        + message
        + """ </h1>
    </body>
    </html>
    """
    )

    # crear elementos MIMEtext
    text_mime = MIMEText(message, "plain")
    # html_mime = MIMEText(html, 'html')

    # adjuntar los MIMEText al MIMEMultipart

    messageMime.attach(text_mime)
    # messageMime.attach(html_mime)

    # conectarnos al puerto 465 de gmail para enviar el correo

    context = ssl.create_default_context()
    emailfrom = EMAIL
    password = PASSWORD
    with smtplib.SMTP_SSL(smtp_address, smtp_port, context=context) as server:
        server.login(emailfrom, password)
        server.sendmail(emailfrom, to, messageMime.as_string())

    return jsonify({"message": "email sent"}), 200


@routes_product.route("/correo", methods=["POST"])
def handle_email():
    body = request.get_json()
    message = body["message"]
    to = body["to"]
    subject = body["subject"]

    sendEmail(message, to, subject)

    return jsonify({"message": "message sent"}), 200


# Handle/serialize errors like a JSON object
@routes_product.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


# Funcion de verificación de token:
def verificacionToken(identity):
    jti = identity["jti"]
    token = TokenBlokedList.query.filter_by(token=jti, is_blocked=True).first()

    if token:
        return True  # Token bloqueado
    else:
        return False  # Token no bloqueado


# Función para validar los requisitos de la contraseña, avanzada.
def validate_password(password):
    # Verifica la longitud mínima y máxima de la contraseña
    if len(password) < 8 or len(password) > 64:
        return False

    # Verifica si contiene al menos una letra mayúscula
    if not re.search("[A-Z]", password):
        return False

    # Verifica si contiene al menos una letra minúscula
    if not re.search("[a-z]", password):
        return False

    # Verifica si contiene al menos un número
    if not re.search("[0-9]", password):
        return False

    # Verifica si contiene al menos un símbolo especial, incluido '*'
    if not re.search("[@#$%^&+=*/]", password):
        return False

    # Verifica si la contraseña es una de las más comunes
    contrasenas_comunes = ["123456", "123456789", "qwerty", "password", "admin"]
    if password in contrasenas_comunes:
        return False

    # Si cumple con todos los requisitos, devuelve True
    return True


# 0 - [GET] /people Listar todos los registros de people en la base de datos


@routes_product.route("/all-products", methods=["GET"])
@jwt_required()
def get_all_products():
    jwt_claims = get_jwt()
    user_id = jwt_claims["user_id"]

    # Obtener todos los productos del usuario logueado
    product = Product.query.filter_by(user_id=user_id).all()
    product = list(map(lambda item: item.serialize(), product))
    print(product)

    return jsonify(product), 200


# Ruta para obtener todos los productos de todos los usuarios.
@routes_product.route("/all-products-general", methods=["GET"])
def get_all_products_general():
    # Obtener todos los productos actualmente en la base de datos
    product = Product.query.all()
    product = list(map(lambda item: item.serialize(), product))
    print(product)

    return jsonify(product), 200


@routes_product.route("/all-products-shoes", methods=["GET"])
def get_all_products_shoes():
    # Obtén la categoría "Zapatos"
    category = Category.query.filter_by(category_name="Zapatos").first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    # Obtén todos los productos en la categoría "Zapatos"
    products = Product.query.filter_by(category_id=category.id).all()
    products = list(map(lambda item: item.serialize(), products))
    print(products)

    return jsonify(products), 200


# Ruta parae crear un producto.
@routes_product.route("/create-product", methods=["POST"])
@jwt_required()
def create_product():
    # Obtenemos el ID del usuario del token
    jwt_claims = get_jwt()
    user_id = jwt_claims["user_id"]

    if "name" not in request.form:
        raise APIException("No name provide")
    if "image" not in request.files:
        raise APIException("No image to upload")
    if "description" not in request.form:
        raise APIException("No description to upload")
    if "price" not in request.form:
        raise APIException("No price provide")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    image_cloudinary_url = cloudinary.uploader.upload(
        request.files["image"],
        public_id=f'{request.form.get("name").replace(" ", "_")}_{timestamp}',
        # Pedir la URL segura de la imagen
        secure=True,
    )[
        "url"
    ]  # Extract the 'url' from the returned dictionary

    # Creamos un nuevo objeto de seller y lo agregamos a la base de datos

    offer_active_str = request.form.get("offer_active")
    offer_active_bool = (
        offer_active_str.lower() == "true" if offer_active_str else False
    )

    new_product = Product(
        name=request.form.get("name"),
        description=request.form.get("description"),
        bar_code=request.form.get("bar_code"),
        image=image_cloudinary_url,
        price=request.form.get("price"),
        stock=request.form.get("stock"),
        color=request.form.get("color"),
        size=request.form.get("size"),
        gender=request.form.get("gender"),
        date_listed=datetime.now(),
        tax=request.form.get("tax"),
        special_tax=request.form.get("special_tax"),
        offer_price=request.form.get("offer_price"),
        # offer_active=request.form.get("offer_active"),
        offer_active=offer_active_bool,
        offer_start_date=request.form.get("offer_start_date"),
        offer_end_date=request.form.get("offer_end_date"),
        category_id=request.form.get("category_id"),
        seller_id=request.form.get("seller_id"),
        user_id=user_id,
    )
    db.session.add(new_product)
    db.session.commit()

    # Devolvemos una respuesta JSON con un mensaje y un código de estado HTTP 201 (creado)
    return jsonify(
        {
            "recipe": request.form.get("name"),
            "image_url": image_cloudinary_url,
            "recipe_id": new_product.id,
        }
    )


# Ruta para obtener un promedio de los ratings de un producto
@routes_product.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Producto no encontrado"}), 404

    avg_rating = (
        db.session.query(func.avg(ReviewProduct.rating))
        .filter_by(product_id=product.id)
        .scalar()
    )
    rating_count = (
        db.session.query(func.count(ReviewProduct.id))
        .filter_by(product_id=product.id)
        .scalar()
    )

    return jsonify(
        {
            "product": product.serialize(),
            "average_rating": avg_rating,
            "rating_count": rating_count,
        }
    )


# Ruta para obtener los detalles de un producto
@routes_product.route("/product/<int:product_id>", methods=["GET"])
def get_product_details(product_id):
    product = Product.query.get(product_id)
    if product is None:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(product.serialize())


@routes_product.route("/products/<int:product_id>/reviews", methods=["POST"])
@jwt_required()
def add_product_review(product_id):
    jwt_claims = get_jwt()
    user_id = jwt_claims["user_id"]

    data = request.get_json()
    rating = data["rating"]
    review = data["review"]

    # Verifica si la puntuación es válida
    if rating is None or not 1 <= rating <= 5:
        return jsonify({"error": "Invalid rating, it must be between 1 and 5."}), 400

    # Verifica si el usuario ya hizo una review para este producto
    existing_review = ReviewProduct.query.filter_by(
        user_id=user_id, product_id=product_id
    ).first()
    if existing_review:
        return jsonify({"error": "You have already reviewed this product."}), 400

    # Crea la nueva review
    new_review = ReviewProduct(
        review=review, rating=rating, user_id=user_id, product_id=product_id
    )
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"message": "Review added successfully."}), 201


# return (
#     jsonify(
#         {
#             "message": "Producto creado correctamente",
#             "image_url": image_cloudinary_url,
#         }
#     ),
#     201,
# )


# # 2 - LOGIN DE USUARIO.
# # VER DOCUMENTACION ADICIONAL SOBRE ESTA RUTA EN: https://www.notion.so/dicttaapp-2-LOGIN-DE-USUARIO-b6b48b0b3ea34b23a55b8b3216cd2ac6?pvs=4


# @api.route("/login", methods=["POST"])  # Corrected the methods parameter
# def user_login():
#     print("user_login function called")  # Agrega esta línea para depurar

#     # Obtenemos los datos del cuerpo de la solicitud
#     email = request.get_json()["email"]
#     password = request.get_json()["password"]

#     user = User.query.filter_by(email=email).first()

#     if user is None:
#         return jsonify({"message": "usuario o contraseña incorrecta"})

#     if not bcrypt.check_password_hash(
#         user.password, password
#     ):  # se compara la contrese encriptada, contra la contraseña encrytada que llega desde el usuario.
#         return jsonify({"message": "usuario o contraseña incorrecta"})

#     # Validación del email.
#     if email != user.email:
#         return jsonify({"message": "usuario o contraseña incorrecta"})

#     # access_token = create_access_token(identity=user.id)
#     access_token = create_access_token(
#         identity=user.id, additional_claims={"user_id": user.id}
#     )
#     return jsonify({"token": access_token}), 200


# # 3 - RUTA A LA QUE IRÍA EL USUARIO UNA VEZ SE REGISTRA
# # VER DOCUMENTACION ADICIONAL SOBRE ESTA RUTA EN: https://www.notion.so/dicttaapp-3-MYACCOUNT-1cf8a6fb177945c4a0ccd4ee0d429698?pvs=4


# @api.route("/myaccount", methods=["GET"])
# @jwt_required()
# def myaccount():
#     # Access the identity of the current user with get_jwt_identity
#     current_user = get_jwt_identity()
#     print(current_app)
#     user = User.query.get(current_user)

#     # VALIDAR si el token existe como bloqueado, con una función previamente definiada.
#     token = verificacionToken(get_jwt())

#     if token:
#         raise APIException({"message": "Inicia sesión para ir a esta rura protegida"})

#     print("El usuario actual es: ", user.name)
#     print("El usuario actual es: ", current_user)
#     return jsonify({"message": "Estas en una ruta protegida", "name": user.name}), 200


# # 4 - LOGOUT DE USER
# # VER DOCUMENTACION ADICIONAL SOBRE ESTA RUTA EN: https://www.notion.so/dicttaapp-4-LOGOUT-a335628a30224d0aa5755a8a0b7e8d68?pvs=4
# @api.route("/logout", methods=["GET"])
# @jwt_required()
# def user_logout():
#     # VER DOCUMENTACION DE LA RUTA ABAJO
#     jti = get_jwt()["jti"]
#     now = datetime.now(timezone.utc)

#     # identificando al usuario:
#     current_user = get_jwt_identity()
#     user = User.query.get(current_user)

#     token_bloked = TokenBlokedList(token=jti, create_at=now, email=user.email)

#     # Guardamos la información en base de datos.
#     db.session.add(token_bloked)
#     db.session.commit()
#     return jsonify({"message": "logout successfully"}), 200


# # 5 - EDITAR UN USUARIO.
# # VER DOCUMENTACION ADICIONAL DE ESTA RUTA EN: https://www.notion.so/dicttaapp-5-myaccount-update-be57cae02ef3417d95adea63217cd1b8?pvs=4
# @api.route("/myaccount/update", methods=["POST"])
# @jwt_required()  # Requiere un token válido para acceder a la ruta.
# def update_user():
#     # Obtenemos el ID del usuario del token
#     jwt_claims = get_jwt()
#     user_id = jwt_claims["user_id"]

#     # Obtenemos la información enviada en la petición
#     data = request.get_json()
#     email = data["email"]
#     name = data["name"]
#     lastname = data["lastname"]
#     # password = data["password"]

#     # Validar el formato del correo electrónico
#     try:
#         validate_email(email)
#     except EmailNotValidError:
#         return (
#             jsonify({"message": "El formato del correo electrónico es inválido."}),
#             400,
#         )

#     # Verificamos si el email ya está en uso por otro usuario
#     existing_user = User.query.filter(User.email == email, User.id != user_id).first()
#     if existing_user:
#         return jsonify({"message": "El email ya está en uso."}), 409

#     # Actualizamos la información del usuario
#     user_to_update = User.query.get(user_id)
#     if user_to_update:
#         user_to_update.email = email
#         user_to_update.name = name
#         user_to_update.lastname = lastname

#         db.session.commit()
#         return jsonify({"message": "Usuario actualizado exitosamente."}), 200
#     else:
#         return jsonify({"message": "Usuario no encontrado."}), 404


# # # 6 - ELIMINAR UN USARIO
# # # VER DOCUMENTACION ADICIONAL DE ESTA RUTA EN: https://www.notion.so/dicttaap-6-myaccount-delete-cbd5495b91854d069be30f53aa00ff26?pvs=4


# @api.route("/myaccount/delete", methods=["DELETE"])
# @jwt_required()  # Requiere un token válido para acceder a la ruta.
# def delete_user():
#     # Obtenemos el ID del usuario de las reclamaciones del token JWT.
#     jwt_claims = get_jwt()
#     # user_id = jwt_claims["user_id"]
#     user_id = jwt_claims["user_id"]

#     # Buscamos al usuario en la base de datos utilizando el ID obtenido.
#     user = User.query.get(user_id)

#     # Eliminamos el usuario de la base de datos y guardamos los cambios.
#     db.session.delete(user)
#     db.session.commit()

#     # Retornamos un mensaje en formato JSON y el código de estado HTTP 200 (OK).
#     return jsonify({"message": "usuario borrado"}), 200


# # # ------------------------------ul----------------------------


# # @api.route("/postrecipe", methods=["POST"])
# # def create_postrecipe():
# #     body = request.get_json()

# #     if body is None:
# #         return (
# #             jsonify({"error": "You need to specify the request body as a JSON object"}),
# #             400,
# #         )

# #     required_fields = [
# #         "name",
# #         "time",
# #         "difficulty",
# #         "description",
# #         "ingredients",
# #         "instructions",
# #         "country_name",
#         "category_name",
#     ]
#     for field in required_fields:
#         if field not in body:
#             return jsonify({"error": f"You need to specify the '{field}' field"}), 400

#     name = body["name"]
#     time = body["time"]
#     difficulty = body["difficulty"]
#     description = body["description"]
#     instructions = body["instructions"]
#     country_name = body["country_name"]
#     category_name = body["category_name"]
#     ingredients = body["ingredients"]
#     new_recipe = Recipe(
#         name=name,
#         time=time,
#         difficulty=difficulty,
#         description=description,
#         instructions=instructions,
#         ingredients=ingredients,
#         # Replace with the actual category ID
#     )

#     db.session.add(new_recipe)
#     db.session.commit()

#     return jsonify({"msg": "Recipe created successfully"}), 201


# @api.route("/editrecipe/<int:recipe_id>", methods=["PUT"])
# def edit_recipe(recipe_id):
#     # Verificamos si la receta existe en la base de datos
#     recipe = Recipe.query.get(recipe_id)
#     if recipe is None:
#         return jsonify({"error": "Recipe not found"}), 404

#     # Obtenemos los datos enviados en el cuerpo de la solicitud
#     body = request.get_json()

#     if body is None:
#         return (
#             jsonify({"error": "You need to specify the request body as a JSON object"}),
#             400,
#         )

#     # Actualizamos los campos necesarios
#     if "name" in body:
#         recipe.name = body["name"]
#     if "time" in body:
#         recipe.time = body["time"]
#     if "difficulty" in body:
#         recipe.difficulty = body["difficulty"]
#     if "description" in body:
#         recipe.description = body["description"]
#     if "instructions" in body:
#         recipe.instructions = body["instructions"]
#     if "ingredients" in body:
#         recipe.ingredients = body["ingredients"]
#     if "country_id" in body:
#         recipe.id_country = body["country_id"]
#     if "category_id" in body:
#         recipe.id_category = body["category_id"]

#     # Guardamos los cambios en la base de datos
#     db.session.commit()

#     return jsonify({"msg": "Recipe updated successfully"}), 200


# @api.route("/deleterecipe", methods=["DELETE"])
# def delete_specific_recipe():
#     body = request.get_json()
#     recipe_id = body.get("id")

#     if not recipe_id:
#         return jsonify({"error": "You need to specify the 'id' field"}), 400

#     recipe = Recipe.query.get(recipe_id)

#     if recipe is None:
#         return jsonify({"error": "Recipe not found"}), 404

#     db.session.delete(recipe)
#     db.session.commit()

#     return jsonify({"msg": "Recipe deleted"}), 200


# @api.route("/getrecipe/<int:recipe_id>", methods=["GET"])
# def get_recipe(recipe_id):
#     # Verificamos si la receta existe en la base de datos
#     recipe = Recipe.query.get(recipe_id)
#     if recipe is None:
#         return jsonify({"error": "Recipe not found"}), 404

#     # Construimos el objeto JSON con la información de la receta
#     recipe_data = {
#         "id": recipe.id,
#         "name": recipe.name,
#         "time": recipe.time,
#         "difficulty": recipe.difficulty,
#         "description": recipe.description,
#         "instructions": recipe.instructions,
#         "country_name": recipe.id_country,
#         "category_name": recipe.id_category,
#         "ingredients": recipe.ingredients,
#     }

#     return jsonify(recipe_data), 200


# @api.route("/getrecipes", methods=["GET"])
# def get_recipes():
#     id = request.args.get("id")
#     name = request.args.get("name")
#     time = request.args.get("time")
#     difficulty = request.args.get("difficulty")
#     description = request.args.get("description")
#     instructions = request.args.get("instructions")
#     ingredients = request.args.get("ingredients")
#     country_name = request.args.get("country_name")
#     category_name = request.args.get("category_name")

#     recipes = Recipe.query
#     if id:
#         recipes = recipes.filter_by(id=id)
#     if name:
#         recipes = recipes.filter_by(name=name)
#     if time:
#         recipes = recipes.filter_by(time=time)
#     if difficulty:
#         recipes = recipes.filter_by(difficulty=difficulty)
#     if description:
#         recipes = recipes.filter_by(description=description)
#     if instructions:
#         recipes = recipes.filter_by(instructions=instructions)
#     if ingredients:
#         recipes = recipes.filter_by(ingredients=ingredients)
#     if country_name:
#         recipes = recipes.filter_by(country_name=country_name)
#     if category_name:
#         recipes = recipes.filter_by(category_name=category_name)

#     recipes = recipes.all()
#     recipes = list(map(lambda item: item.serialize(), recipes))

#     # Construimos el objeto JSON con la información de la receta
#     return jsonify(recipes), 200


# @api.route("/getfavorito", methods=["GET"])
# @jwt_required()  # Requiere un token válido para acceder a la ruta.
# def get_favorito():
#     user_id = get_jwt_identity()
#     user = User.query.get(user_id)
#     if user is None:
#         return {"message": "Usuario no encontrado"}
#     favoritos = Favorito.query.filter_by(user_id=user_id).all()
#     lista_favoritos = []
#     # Obtenemos el ID del usuario del token
#     for favorito in favoritos:
#         lista_favoritos.append(
#             {
#                 "id": favorito.id,
#                 "nombre": favorito.nombre,
#                 # Agrega más campos si es necesario
#             }
#         )

#     return lista_favoritos, 200
#     # Aquí debes agregar la lógica para obtener los favoritos del usuario con el ID user_id


# @api.route("/postfavorito", methods=["POST"])
# def post_favorito():
#     body = request.get_json()
#     user_id = body["user_id"]
#     recipe_id = body["recipe_id"]

#     if body is None:
#         raise APIException(
#             "You need to specify the request body as a JSON object", status_code=400
#         )
#     if "user_id" not in body:
#         raise APIException("You need to specify the user ID", status_code=400)
#     if "recipe_id" not in body:
#         raise APIException("You need to specify the recipe ID", status_code=400)

#     favorito = Favorito.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
#     if favorito is not None:
#         raise APIException("Favorite already exists", status_code=409)

#     new_favorite = Favorito(user_id=user_id, recipe_id=recipe_id)

#     db.session.add(new_favorite)
#     db.session.commit()

#     return jsonify({"msg": "Favorite successfully created"}), 201


# @api.route("/deletefavoritos", methods=["DELETE"])
# def delete_specific_favorite():
#     body = request.get_json()
#     favorite_id = body["id"]

#     favorito = Favorito.query.get(favorite_id)

#     if favorito is None:
#         return jsonify({"error": "Favorite not found"}), 404

#     db.session.delete(favorito)
#     db.session.commit()

#     return (jsonify({"msg": "Favorite deleted"}),)


# s = URLSafeTimedSerializer("any key works")


# @api.route("/newcategory", methods=["POST"])
# def new_category():
#     body = request.get_json()
#     name = body["name"]

#     if body is None:
#         raise APIException(
#             "You need to specify the request body as a JSON object", status_code=400
#         )

#     if "name" not in body:
#         raise APIException("You need to specify the name", status_code=400)

#     new_category = Category.query.filter_by(name=name).first()
#     if new_category is not None:
#         raise APIException("Category already exists", status_code=409)

#     new_category = Category(name=name)

#     db.session.add(new_category)
#     db.session.commit()

#     return jsonify({"msg": "Category successfully created"}), 201


# @api.route("/getcategory", methods=["GET"])
# def get_category():
#     id = request.args.get("id", None)
#     name = request.args.get("name", None)

#     category_query = Category.query
#     if id:
#         category_query = category_query.filter_by(id=id)
#     if name:
#         category_query = category_query.filter_by(name=name)

#     categories = category_query.all()
#     categories = [category.serialize() for category in categories]

#     return jsonify(categories)


# @api.route("/deletecategory", methods=["DELETE"])
# def delete_specific_category():
#     body = request.get_json()
#     category_id = body["id"]

#     category = Category.query.get(category_id)

#     if category is None:
#         return jsonify({"error": "Category not found"}), 404

#     db.session.delete(category)
#     db.session.commit()

#     return jsonify({"msg": "Category deleted"}), 200


# @api.route("/newcountry", methods=["POST"])
# def new_country():
#     body = request.get_json()
#     name = body["name"]

#     if body is None:
#         raise APIException(
#             "You need to specify the request body as a JSON object", status_code=400
#         )

#     if "name" not in body:
#         raise APIException("You need to specify the name", status_code=400)

#     new_country = Country.query.filter_by(name=name).first()
#     if new_country is not None:
#         raise APIException("Country already exists", status_code=409)

#     new_country = Country(name=name)

#     db.session.add(new_country)
#     db.session.commit()

#     return jsonify({"msg": "Country successfully created"}), 201


# @api.route("/getcountry", methods=["GET"])
# def get_country():
#     id = request.args.get("id", None)
#     name = request.args.get("name", None)

#     country = Country.query
#     if id:
#         country = country.filter_by(id=id)
#     if name:
#         country = country.filter_by(name=name)

#     country = country.all()
#     country_data = [item.serialize() for item in country]

#     return jsonify(country_data)


# @api.route("/deletecountry", methods=["DELETE"])
# def delete_specific_country():
#     body = request.get_json()
#     country_id = body["id"]

#     country = Country.query.get(country_id)

#     if country is None:
#         return jsonify({"error": "Country not found"}), 404

#     db.session.delete(country)
#     db.session.commit()

#     return jsonify({"msg": "Country deleted"}), 200


# @api.route("/newlike", methods=["POST"])
# def new_like():
#     body = request.get_json()
#     recipe_id = body["recipe_id"]

#     if body is None:
#         raise APIException(
#             "You need to specify the request body as a JSON object", status_code=400
#         )

#     if "recipe_id" not in body:
#         raise APIException("You need to specify the ID of the recipe", status_code=400)

#     recipe = Recipe.query.get(recipe_id)
#     if recipe is None:
#         raise APIException("Recipe not found", status_code=404)

#     recipe.likes += 1
#     db.session.commit()

#     return jsonify({"msg": "Like added successfully"}), 200


# @api.route("/deletelike", methods=["PUT"])
# def delete_like():
#     body = request.get_json()
#     recipe_id = body["recipe_id"]

#     if body is None:
#         raise APIException(
#             "You need to specify the request body as a JSON object", status_code=400
#         )

#     if "recipe_id" not in body:
#         raise APIException("You need to specify the ID of the recipe", status_code=400)

#     recipe = Recipe.query.get(recipe_id)
#     if recipe is None:
#         raise APIException("Recipe not found", status_code=404)

#     if recipe.likes > 0:
#         recipe.likes -= 1
#         db.session.commit()

#     return jsonify({"msg": "Like deleted successfully"}), 200


# @api.route("/new_password", methods=["PUT"])
# def new_password():
#     body = request.get_json()
#     token = body["token"]
#     user_id = s.loads(token.replace("_", "."), max_age=1800)
#     user = User.query.get(user_id)
#     password = body["password"]
#     user.password = bcrypt.generate_password_hash(password, 10).decode("utf-8")
#     db.session.commit()
#     return jsonify({"message": "Password reset successfully"})
