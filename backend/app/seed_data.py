import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    User, Course, Unit, Skill, Lesson, Exercise,
    UserSkillProgress, UserLessonProgress, Quest, UserQuest,
    LeaderboardUser, ShopItem
)

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Course).first():
        print("Database already contains data, skipping seed.")
        return

    print("Seeding database with Duolingo Spanish course and demo content...")

    # 1. Create Default Learner
    user = User(
        id=1,
        username="duo_learner",
        display_name="Alex Learner",
        email="learner@duolingo.local",
        avatar="duo-owl",
        xp=165,
        streak=4,
        hearts=5,
        max_hearts=5,
        gems=520,
        league="Silver League",
        last_active_date=datetime.utcnow().strftime("%Y-%m-%d"),
        streak_freeze_count=1,
    )
    db.add(user)
    db.commit()

    # 2. Create Course
    course = Course(
        id="es-en",
        title="Spanish",
        description="Learn Spanish from scratch: food, greetings, travel, and essentials!",
        flag_emoji="🇪🇸",
        total_xp=2400
    )
    db.add(course)
    db.commit()

    # 3. Create Unit 1
    unit1 = Unit(
        course_id="es-en",
        unit_number=1,
        title="Unit 1",
        description="Order in a café, introduce yourself & meet friends",
        color="green",
        order_index=1
    )
    db.add(unit1)
    db.commit()

    # 3.1 Skill 1: Basics 1
    skill1 = Skill(
        unit_id=unit1.id,
        title="Basics 1",
        description="Learn fundamental nouns and simple sentences",
        icon="book",
        total_lessons=3,
        order_index=1
    )
    db.add(skill1)
    db.commit()

    # Skill 1, Lesson 1
    l1 = Lesson(skill_id=skill1.id, title="Lesson 1: Intro to Nouns", xp_reward=15, order_index=1)
    db.add(l1)
    db.commit()

    ex1 = Exercise(
        lesson_id=l1.id,
        type="multiple_choice",
        prompt="Which one of these is 'the boy'?",
        question="Select the correct image & translation",
        audio_text="El niño",
        correct_answer="el niño",
        options_json=json.dumps([
            {"text": "el niño", "sub": "the boy", "icon": "👦"},
            {"text": "la niña", "sub": "the girl", "icon": "👧"},
            {"text": "la manzana", "sub": "the apple", "icon": "🍎"}
        ]),
        explanation="'El niño' means 'the boy'. In Spanish, masculine singular nouns take 'el'.",
        order_index=1
    )
    ex2 = Exercise(
        lesson_id=l1.id,
        type="translate",
        prompt="Translate this sentence",
        question="La mujer bebe agua.",
        audio_text="La mujer bebe agua.",
        correct_answer="The woman drinks water",
        options_json=json.dumps(["The", "woman", "drinks", "water", "eats", "boy", "apple", "milk"]),
        explanation="'La mujer' = The woman, 'bebe' = drinks, 'agua' = water.",
        order_index=2
    )
    ex3 = Exercise(
        lesson_id=l1.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Match the Spanish and English vocabulary",
        correct_answer=json.dumps({
            "boy": "el niño",
            "girl": "la niña",
            "water": "el agua",
            "apple": "la manzana",
            "bread": "el pan"
        }),
        options_json=json.dumps({
            "left": ["boy", "girl", "water", "apple", "bread"],
            "right": ["la manzana", "el niño", "el pan", "el agua", "la niña"]
        }),
        explanation="Great vocabulary matching!",
        order_index=3
    )
    ex4 = Exercise(
        lesson_id=l1.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Yo ___ un hombre.",
        audio_text="Yo soy un hombre.",
        correct_answer="soy",
        options_json=json.dumps(["soy", "eres", "es", "somos"]),
        explanation="For 'yo' (I), the present tense of ser is 'soy' (I am).",
        order_index=4
    )
    ex5 = Exercise(
        lesson_id=l1.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="The man",
        audio_text="El hombre",
        correct_answer="el hombre",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'The man' translates to 'El hombre'.",
        order_index=5
    )
    db.add_all([ex1, ex2, ex3, ex4, ex5])
    db.commit()

    # Skill 1, Lesson 2
    l2 = Lesson(skill_id=skill1.id, title="Lesson 2: Eating & Drinking", xp_reward=15, order_index=2)
    db.add(l2)
    db.commit()

    ex2_1 = Exercise(
        lesson_id=l2.id,
        type="multiple_choice",
        prompt="Which of these is 'the apple'?",
        question="Select the matching item",
        audio_text="La manzana",
        correct_answer="la manzana",
        options_json=json.dumps([
            {"text": "el pan", "sub": "the bread", "icon": "🍞"},
            {"text": "la manzana", "sub": "the apple", "icon": "🍎"},
            {"text": "la leche", "sub": "the milk", "icon": "🥛"}
        ]),
        explanation="'La manzana' is feminine, so it uses the article 'la'.",
        order_index=1
    )
    ex2_2 = Exercise(
        lesson_id=l2.id,
        type="translate",
        prompt="Translate this sentence",
        question="El niño come pan.",
        audio_text="El niño come pan.",
        correct_answer="The boy eats bread",
        options_json=json.dumps(["The", "boy", "eats", "bread", "drinks", "water", "girl", "is"]),
        explanation="'come' comes from the verb 'comer' (to eat).",
        order_index=2
    )
    ex2_3 = Exercise(
        lesson_id=l2.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Match the Spanish food & drink terms",
        correct_answer=json.dumps({
            "man": "el hombre",
            "woman": "la mujer",
            "bread": "el pan",
            "milk": "la leche",
            "drinks": "bebe"
        }),
        options_json=json.dumps({
            "left": ["man", "woman", "bread", "milk", "drinks"],
            "right": ["la leche", "el hombre", "bebe", "la mujer", "el pan"]
        }),
        explanation="Vocabulary mastered!",
        order_index=3
    )
    ex2_4 = Exercise(
        lesson_id=l2.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Ella ___ leche.",
        audio_text="Ella bebe leche.",
        correct_answer="bebe",
        options_json=json.dumps(["bebe", "bebo", "beben", "bebes"]),
        explanation="For 'ella' (she), the third person singular form is 'bebe'.",
        order_index=4
    )
    ex2_5 = Exercise(
        lesson_id=l2.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="I drink water",
        audio_text="Yo bebo agua",
        correct_answer="yo bebo agua",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Yo bebo agua' or 'Bebo agua' are both correct in Spanish.",
        order_index=5
    )
    db.add_all([ex2_1, ex2_2, ex2_3, ex2_4, ex2_5])
    db.commit()

    # Skill 1, Lesson 3
    l3 = Lesson(skill_id=skill1.id, title="Lesson 3: Pronouns & Verification", xp_reward=15, order_index=3)
    db.add(l3)
    db.commit()

    ex3_1 = Exercise(
        lesson_id=l3.id,
        type="multiple_choice",
        prompt="What does 'Tú eres' mean?",
        question="Choose the English meaning",
        audio_text="Tú eres un niño",
        correct_answer="You are",
        options_json=json.dumps([
            {"text": "You are", "sub": "informal you", "icon": "👉"},
            {"text": "I am", "sub": "first person", "icon": "🙋"},
            {"text": "He is", "sub": "third person", "icon": "👤"}
        ]),
        explanation="'Tú' means 'you' (informal), and 'eres' means 'are'.",
        order_index=1
    )
    ex3_2 = Exercise(
        lesson_id=l3.id,
        type="translate",
        prompt="Translate this sentence",
        question="Tú eres un niño.",
        audio_text="Tú eres un niño.",
        correct_answer="You are a boy",
        options_json=json.dumps(["You", "are", "a", "boy", "girl", "eating", "man", "am"]),
        explanation="'Tú eres un niño' = You are a boy.",
        order_index=2
    )
    ex3_3 = Exercise(
        lesson_id=l3.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Pronouns matching",
        correct_answer=json.dumps({
            "I": "yo",
            "you": "tú",
            "he": "él",
            "she": "ella",
            "we": "nosotros"
        }),
        options_json=json.dumps({
            "left": ["I", "you", "he", "she", "we"],
            "right": ["ella", "yo", "nosotros", "tú", "él"]
        }),
        explanation="Spanish pronouns nailed!",
        order_index=3
    )
    ex3_4 = Exercise(
        lesson_id=l3.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Él come una ___.",
        audio_text="Él come una manzana.",
        correct_answer="manzana",
        options_json=json.dumps(["manzana", "pan", "agua", "niño"]),
        explanation="'Una' is feminine, so it pairs with 'manzana'.",
        order_index=4
    )
    ex3_5 = Exercise(
        lesson_id=l3.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="An apple",
        audio_text="Una manzana",
        correct_answer="una manzana",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Una manzana' is feminine singular.",
        order_index=5
    )
    db.add_all([ex3_1, ex3_2, ex3_3, ex3_4, ex3_5])
    db.commit()

    # 3.2 Skill 2: Greetings
    skill2 = Skill(
        unit_id=unit1.id,
        title="Greetings",
        description="Say hello, introduce yourself, and show courtesy",
        icon="chat",
        total_lessons=3,
        order_index=2
    )
    db.add(skill2)
    db.commit()

    # Skill 2, Lesson 1
    s2_l1 = Lesson(skill_id=skill2.id, title="Lesson 1: Hello & Polite Greetings", xp_reward=15, order_index=1)
    db.add(s2_l1)
    db.commit()

    s2_ex1 = Exercise(
        lesson_id=s2_l1.id,
        type="multiple_choice",
        prompt="How do you say 'Hello' in Spanish?",
        question="Select the greeting",
        audio_text="¡Hola!",
        correct_answer="Hola",
        options_json=json.dumps([
            {"text": "Hola", "sub": "Hello / Hi", "icon": "👋"},
            {"text": "Adiós", "sub": "Goodbye", "icon": "🚪"},
            {"text": "Gracias", "sub": "Thank you", "icon": "🙏"}
        ]),
        explanation="'¡Hola!' is the most common friendly Spanish greeting.",
        order_index=1
    )
    s2_ex2 = Exercise(
        lesson_id=s2_l1.id,
        type="translate",
        prompt="Translate this sentence",
        question="Buenos días, mucho gusto.",
        audio_text="Buenos días, mucho gusto.",
        correct_answer="Good morning nice to meet you",
        options_json=json.dumps(["Good", "morning", "nice", "to", "meet", "you", "night", "goodbye", "please"]),
        explanation="'Buenos días' = Good morning. 'Mucho gusto' = Nice to meet you.",
        order_index=2
    )
    s2_ex3 = Exercise(
        lesson_id=s2_l1.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Match Spanish greetings",
        correct_answer=json.dumps({
            "hello": "hola",
            "good morning": "buenos días",
            "please": "por favor",
            "thanks": "gracias",
            "good night": "buenas noches"
        }),
        options_json=json.dumps({
            "left": ["hello", "good morning", "please", "thanks", "good night"],
            "right": ["gracias", "buenas noches", "hola", "por favor", "buenos días"]
        }),
        explanation="Superb manners in Spanish!",
        order_index=3
    )
    s2_ex4 = Exercise(
        lesson_id=s2_l1.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="¡Hola! ¿Cómo ___ tú?",
        audio_text="¡Hola! ¿Cómo estás tú?",
        correct_answer="estás",
        options_json=json.dumps(["estás", "está", "estoy", "están"]),
        explanation="'¿Cómo estás?' is how you ask 'How are you?' to a friend.",
        order_index=4
    )
    s2_ex5 = Exercise(
        lesson_id=s2_l1.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="Good night",
        audio_text="Buenas noches",
        correct_answer="buenas noches",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Buenas noches' means both 'Good evening' and 'Good night'.",
        order_index=5
    )
    db.add_all([s2_ex1, s2_ex2, s2_ex3, s2_ex4, s2_ex5])
    db.commit()

    # Skill 2, Lesson 2
    s2_l2 = Lesson(skill_id=skill2.id, title="Lesson 2: Saying Goodbye", xp_reward=15, order_index=2)
    db.add(s2_l2)
    db.commit()

    s2_l2_ex1 = Exercise(
        lesson_id=s2_l2.id,
        type="multiple_choice",
        prompt="What does 'Hasta luego' mean?",
        question="Choose the right farewell",
        audio_text="Hasta luego",
        correct_answer="See you later",
        options_json=json.dumps([
            {"text": "See you later", "sub": "Until later", "icon": "👋"},
            {"text": "Good morning", "sub": "Morning greeting", "icon": "🌅"},
            {"text": "You're welcome", "sub": "Polite response", "icon": "🤝"}
        ]),
        explanation="'Hasta luego' literally means 'until later' or 'see you later'.",
        order_index=1
    )
    s2_l2_ex2 = Exercise(
        lesson_id=s2_l2.id,
        type="translate",
        prompt="Translate this sentence",
        question="Hasta mañana, adiós.",
        audio_text="Hasta mañana, adiós.",
        correct_answer="See you tomorrow goodbye",
        options_json=json.dumps(["See", "you", "tomorrow", "goodbye", "yesterday", "hello", "today", "thanks"]),
        explanation="'Hasta mañana' = See you tomorrow.",
        order_index=2
    )
    s2_l2_ex3 = Exercise(
        lesson_id=s2_l2.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Farewell pairs",
        correct_answer=json.dumps({
            "bye": "adiós",
            "see you later": "hasta luego",
            "see you soon": "hasta pronto",
            "tomorrow": "mañana",
            "yes": "sí"
        }),
        options_json=json.dumps({
            "left": ["bye", "see you later", "see you soon", "tomorrow", "yes"],
            "right": ["hasta luego", "mañana", "sí", "adiós", "hasta pronto"]
        }),
        explanation="Natural farewell phrases!",
        order_index=3
    )
    s2_l2_ex4 = Exercise(
        lesson_id=s2_l2.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Muchas ___, adiós.",
        audio_text="Muchas gracias, adiós.",
        correct_answer="gracias",
        options_json=json.dumps(["gracias", "por favor", "de nada", "hola"]),
        explanation="'Muchas gracias' means 'Thank you very much'.",
        order_index=4
    )
    s2_l2_ex5 = Exercise(
        lesson_id=s2_l2.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="Please",
        audio_text="Por favor",
        correct_answer="por favor",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Por favor' is Spanish for 'Please'.",
        order_index=5
    )
    db.add_all([s2_l2_ex1, s2_l2_ex2, s2_l2_ex3, s2_l2_ex4, s2_l2_ex5])
    db.commit()

    # Skill 2, Lesson 3
    s2_l3 = Lesson(skill_id=skill2.id, title="Lesson 3: Introductions & Courtesy", xp_reward=15, order_index=3)
    db.add(s2_l3)
    db.commit()

    s2_l3_ex1 = Exercise(
        lesson_id=s2_l3.id,
        type="translate",
        prompt="Translate this question",
        question="¿Cómo te llamas?",
        audio_text="¿Cómo te llamas?",
        correct_answer="What is your name",
        options_json=json.dumps(["What", "is", "your", "name", "where", "are", "you", "from", "how"]),
        explanation="'¿Cómo te llamas?' translates directly to 'What is your name?'.",
        order_index=1
    )
    s2_l3_ex2 = Exercise(
        lesson_id=s2_l3.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Me ___ Mateo.",
        audio_text="Me llamo Mateo.",
        correct_answer="llamo",
        options_json=json.dumps(["llamo", "llamas", "llama", "llaman"]),
        explanation="'Me llamo' means 'My name is' (literally 'I call myself').",
        order_index=2
    )
    s2_l3_ex3 = Exercise(
        lesson_id=s2_l3.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Spanish politeness",
        correct_answer=json.dumps({
            "excuse me": "disculpe",
            "sorry": "lo siento",
            "you are welcome": "de nada",
            "my name is": "me llamo",
            "very well": "muy bien"
        }),
        options_json=json.dumps({
            "left": ["excuse me", "sorry", "you are welcome", "my name is", "very well"],
            "right": ["me llamo", "disculpe", "muy bien", "lo siento", "de nada"]
        }),
        explanation="Polite conversation terms!",
        order_index=3
    )
    s2_l3_ex4 = Exercise(
        lesson_id=s2_l3.id,
        type="multiple_choice",
        prompt="What is the response to '¡Gracias!'?",
        question="Choose the polite answer",
        audio_text="De nada",
        correct_answer="De nada",
        options_json=json.dumps([
            {"text": "De nada", "sub": "You're welcome", "icon": "😊"},
            {"text": "Por favor", "sub": "Please", "icon": "🙏"},
            {"text": "Lo siento", "sub": "I'm sorry", "icon": "😔"}
        ]),
        explanation="'De nada' is the standard polite reply to 'Gracias'.",
        order_index=4
    )
    s2_l3_ex5 = Exercise(
        lesson_id=s2_l3.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="I am sorry",
        audio_text="Lo siento",
        correct_answer="lo siento",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Lo siento' means 'I am sorry'.",
        order_index=5
    )
    db.add_all([s2_l3_ex1, s2_l3_ex2, s2_l3_ex3, s2_l3_ex4, s2_l3_ex5])
    db.commit()

    # 3.3 Skill 3: Cafe & Dining
    skill3 = Skill(
        unit_id=unit1.id,
        title="Café & Food",
        description="Order coffee, food, and ask for the bill at a restaurant",
        icon="coffee",
        total_lessons=2,
        order_index=3
    )
    db.add(skill3)
    db.commit()

    s3_l1 = Lesson(skill_id=skill3.id, title="Lesson 1: Ordering Coffee", xp_reward=15, order_index=1)
    db.add(s3_l1)
    db.commit()

    s3_ex1 = Exercise(
        lesson_id=s3_l1.id,
        type="multiple_choice",
        prompt="Which of these is 'coffee with milk'?",
        question="Select the beverage",
        audio_text="Un café con leche",
        correct_answer="un café con leche",
        options_json=json.dumps([
            {"text": "un café con leche", "sub": "coffee with milk", "icon": "☕"},
            {"text": "un té verde", "sub": "green tea", "icon": "🍵"},
            {"text": "un vaso de agua", "sub": "glass of water", "icon": "🥛"}
        ]),
        explanation="'Un café con leche' is a staple in Spanish cafes.",
        order_index=1
    )
    s3_ex2 = Exercise(
        lesson_id=s3_l1.id,
        type="translate",
        prompt="Translate this sentence",
        question="Una mesa para dos, por favor.",
        audio_text="Una mesa para dos, por favor.",
        correct_answer="A table for two please",
        options_json=json.dumps(["A", "table", "for", "two", "please", "three", "coffee", "with", "sugar"]),
        explanation="'Una mesa para dos' = A table for two.",
        order_index=2
    )
    s3_ex3 = Exercise(
        lesson_id=s3_l1.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Café items",
        correct_answer=json.dumps({
            "coffee": "el café",
            "tea": "el té",
            "sugar": "el azúcar",
            "bill": "la cuenta",
            "table": "la mesa"
        }),
        options_json=json.dumps({
            "left": ["coffee", "tea", "sugar", "bill", "table"],
            "right": ["la cuenta", "el café", "la mesa", "el té", "el azúcar"]
        }),
        explanation="Ready to visit a Spanish café!",
        order_index=3
    )
    s3_ex4 = Exercise(
        lesson_id=s3_l1.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Yo quiero una taza de ___ con azúcar.",
        audio_text="Yo quiero una taza de café con azúcar.",
        correct_answer="café",
        options_json=json.dumps(["café", "pan", "mesa", "carta"]),
        explanation="'Una taza de café' = A cup of coffee.",
        order_index=4
    )
    s3_ex5 = Exercise(
        lesson_id=s3_l1.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="The check, please",
        audio_text="La cuenta, por favor",
        correct_answer="la cuenta, por favor",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'La cuenta, por favor' is the standard way to ask for the bill.",
        order_index=5
    )
    db.add_all([s3_ex1, s3_ex2, s3_ex3, s3_ex4, s3_ex5])
    db.commit()

    # 4. Create Unit 2
    unit2 = Unit(
        course_id="es-en",
        unit_number=2,
        title="Unit 2",
        description="Navigate travel, ask for directions, and talk about family",
        color="blue",
        order_index=2
    )
    db.add(unit2)
    db.commit()

    # Skill 4: Travel
    skill4 = Skill(
        unit_id=unit2.id,
        title="Travel",
        description="Find transportation, hotels, and airport locations",
        icon="plane",
        total_lessons=2,
        order_index=1
    )
    db.add(skill4)
    db.commit()

    s4_l1 = Lesson(skill_id=skill4.id, title="Lesson 1: Transport & Airport", xp_reward=20, order_index=1)
    db.add(s4_l1)
    db.commit()

    s4_ex1 = Exercise(
        lesson_id=s4_l1.id,
        type="multiple_choice",
        prompt="Which of these is 'the airport'?",
        question="Select the travel destination",
        audio_text="El aeropuerto",
        correct_answer="el aeropuerto",
        options_json=json.dumps([
            {"text": "el aeropuerto", "sub": "the airport", "icon": "✈️"},
            {"text": "el hotel", "sub": "the hotel", "icon": "🏨"},
            {"text": "la estación", "sub": "the station", "icon": "🚉"}
        ]),
        explanation="'El aeropuerto' is the airport.",
        order_index=1
    )
    s4_ex2 = Exercise(
        lesson_id=s4_l1.id,
        type="translate",
        prompt="Translate this sentence",
        question="¿Dónde está la estación de tren?",
        audio_text="¿Dónde está la estación de tren?",
        correct_answer="Where is the train station",
        options_json=json.dumps(["Where", "is", "the", "train", "station", "airport", "bus", "hotel", "my"]),
        explanation="'¿Dónde está...?' asks 'Where is...?'",
        order_index=2
    )
    s4_ex3 = Exercise(
        lesson_id=s4_l1.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Travel terms",
        correct_answer=json.dumps({
            "airport": "el aeropuerto",
            "train": "el tren",
            "hotel": "el hotel",
            "passport": "el pasaporte",
            "ticket": "el boleto"
        }),
        options_json=json.dumps({
            "left": ["airport", "train", "hotel", "passport", "ticket"],
            "right": ["el hotel", "el boleto", "el aeropuerto", "el tren", "el pasaporte"]
        }),
        explanation="Ready for vacation!",
        order_index=3
    )
    s4_ex4 = Exercise(
        lesson_id=s4_l1.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Necesito mi ___ para el vuelo.",
        audio_text="Necesito mi pasaporte para el vuelo.",
        correct_answer="pasaporte",
        options_json=json.dumps(["pasaporte", "mesa", "leche", "niño"]),
        explanation="You need a 'pasaporte' (passport) for the flight.",
        order_index=4
    )
    s4_ex5 = Exercise(
        lesson_id=s4_l1.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="A ticket to Madrid",
        audio_text="Un boleto a Madrid",
        correct_answer="un boleto a madrid",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Un boleto a Madrid' = A ticket to Madrid.",
        order_index=5
    )
    db.add_all([s4_ex1, s4_ex2, s4_ex3, s4_ex4, s4_ex5])
    db.commit()

    # Skill 5: Family
    skill5 = Skill(
        unit_id=unit2.id,
        title="Family",
        description="Talk about relatives and home life",
        icon="heart",
        total_lessons=2,
        order_index=2
    )
    db.add(skill5)
    db.commit()

    s5_l1 = Lesson(skill_id=skill5.id, title="Lesson 1: Family Members", xp_reward=20, order_index=1)
    db.add(s5_l1)
    db.commit()

    s5_ex1 = Exercise(
        lesson_id=s5_l1.id,
        type="multiple_choice",
        prompt="Which of these is 'my mother'?",
        question="Family vocabulary",
        audio_text="Mi madre",
        correct_answer="mi madre",
        options_json=json.dumps([
            {"text": "mi madre", "sub": "my mother", "icon": "👩"},
            {"text": "mi padre", "sub": "my father", "icon": "👨"},
            {"text": "mi hermano", "sub": "my brother", "icon": "👦"}
        ]),
        explanation="'Mi madre' means 'my mother'.",
        order_index=1
    )
    s5_ex2 = Exercise(
        lesson_id=s5_l1.id,
        type="translate",
        prompt="Translate this sentence",
        question="Mi hermano vive en Barcelona.",
        audio_text="Mi hermano vive en Barcelona.",
        correct_answer="My brother lives in Barcelona",
        options_json=json.dumps(["My", "brother", "lives", "in", "Barcelona", "sister", "mother", "Madrid", "eats"]),
        explanation="'vive' is from 'vivir' (to live).",
        order_index=2
    )
    s5_ex3 = Exercise(
        lesson_id=s5_l1.id,
        type="match_pairs",
        prompt="Tap the matching pairs",
        question="Family members",
        correct_answer=json.dumps({
            "mother": "la madre",
            "father": "el padre",
            "brother": "el hermano",
            "sister": "la hermana",
            "family": "la familia"
        }),
        options_json=json.dumps({
            "left": ["mother", "father", "brother", "sister", "family"],
            "right": ["el hermano", "la familia", "la madre", "la hermana", "el padre"]
        }),
        explanation="Family relations mastered!",
        order_index=3
    )
    s5_ex4 = Exercise(
        lesson_id=s5_l1.id,
        type="fill_blank",
        prompt="Fill in the blank",
        question="Tengo un ___ muy cariñoso.",
        audio_text="Tengo un perro muy cariñoso.",
        correct_answer="perro",
        options_json=json.dumps(["perro", "tren", "azúcar", "cuenta"]),
        explanation="'Perro' means dog.",
        order_index=4
    )
    s5_ex5 = Exercise(
        lesson_id=s5_l1.id,
        type="type_answer",
        prompt="Write this in Spanish",
        question="I have a sister",
        audio_text="Tengo una hermana",
        correct_answer="tengo una hermana",
        options_json=json.dumps(["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]),
        explanation="'Tengo una hermana' = I have a sister.",
        order_index=5
    )
    db.add_all([s5_ex1, s5_ex2, s5_ex3, s5_ex4, s5_ex5])
    db.commit()

    # 5. Seed User Progress
    # Skill 1: Completed! (Crown 1, 3/3 lessons done)
    sp1 = UserSkillProgress(
        user_id=1,
        skill_id=skill1.id,
        status="completed",
        completed_lessons=3,
        crown_level=1,
        is_legendary=False
    )
    # Skill 2: In progress (available, 1/3 lessons done)
    sp2 = UserSkillProgress(
        user_id=1,
        skill_id=skill2.id,
        status="available",
        completed_lessons=1,
        crown_level=0,
        is_legendary=False
    )
    # Skill 3: Available (unlocked because Skill 1 completed)
    sp3 = UserSkillProgress(
        user_id=1,
        skill_id=skill3.id,
        status="available",
        completed_lessons=0,
        crown_level=0,
        is_legendary=False
    )
    # Skills 4 & 5: Locked until Unit 1 complete
    sp4 = UserSkillProgress(
        user_id=1,
        skill_id=skill4.id,
        status="locked",
        completed_lessons=0,
        crown_level=0,
        is_legendary=False
    )
    sp5 = UserSkillProgress(
        user_id=1,
        skill_id=skill5.id,
        status="locked",
        completed_lessons=0,
        crown_level=0,
        is_legendary=False
    )
    db.add_all([sp1, sp2, sp3, sp4, sp5])

    # Add Lesson completions for Skill 1 (all 3) and Skill 2 (lesson 1)
    lp1 = UserLessonProgress(user_id=1, lesson_id=l1.id, skill_id=skill1.id, completed=True, accuracy=100.0)
    lp2 = UserLessonProgress(user_id=1, lesson_id=l2.id, skill_id=skill1.id, completed=True, accuracy=90.0)
    lp3 = UserLessonProgress(user_id=1, lesson_id=l3.id, skill_id=skill1.id, completed=True, accuracy=95.0)
    lp4 = UserLessonProgress(user_id=1, lesson_id=s2_l1.id, skill_id=skill2.id, completed=True, accuracy=100.0)
    db.add_all([lp1, lp2, lp3, lp4])
    db.commit()

    # 6. Seed Quests
    q1 = Quest(
        id="daily-xp-30",
        title="Earn 30 XP",
        description="Gain 30 XP in lessons or practice today",
        icon="zap",
        target=30,
        xp_reward=15,
        gem_reward=10,
        quest_type="xp"
    )
    q2 = Quest(
        id="complete-2-lessons",
        title="Complete 2 lessons",
        description="Finish any 2 skill lessons today",
        icon="check-circle",
        target=2,
        xp_reward=20,
        gem_reward=15,
        quest_type="lessons"
    )
    q3 = Quest(
        id="perfect-lesson",
        title="Score 90% or higher",
        description="Finish a lesson with near-perfect accuracy",
        icon="star",
        target=1,
        xp_reward=25,
        gem_reward=20,
        quest_type="accuracy"
    )
    db.add_all([q1, q2, q3])
    db.commit()

    # User quest states
    uq1 = UserQuest(user_id=1, quest_id="daily-xp-30", current_progress=15, completed=False, claimed=False)
    uq2 = UserQuest(user_id=1, quest_id="complete-2-lessons", current_progress=1, completed=False, claimed=False)
    uq3 = UserQuest(user_id=1, quest_id="perfect-lesson", current_progress=1, completed=True, claimed=False)
    db.add_all([uq1, uq2, uq3])
    db.commit()

    # 7. Seed Leaderboard Users (Silver League)
    leaderboard = [
        LeaderboardUser(id=1, username="carmen_s", display_name="Carmen S.", avatar="fox", xp=280, league="Silver League", is_user=False),
        LeaderboardUser(id=2, username="marco_polo", display_name="Marco P.", avatar="bear", xp=245, league="Silver League", is_user=False),
        LeaderboardUser(id=3, username="lucia_dev", display_name="Lucía R.", avatar="cat", xp=210, league="Silver League", is_user=False),
        LeaderboardUser(id=4, username="duo_learner", display_name="Alex Learner (You)", avatar="duo-owl", xp=165, league="Silver League", is_user=True),
        LeaderboardUser(id=5, username="mateo_99", display_name="Mateo G.", avatar="dog", xp=140, league="Silver League", is_user=False),
        LeaderboardUser(id=6, username="elena_v", display_name="Elena V.", avatar="frog", xp=125, league="Silver League", is_user=False),
        LeaderboardUser(id=7, username="david_k", display_name="David K.", avatar="koala", xp=95, league="Silver League", is_user=False),
        LeaderboardUser(id=8, username="sarah_lingo", display_name="Sarah M.", avatar="panda", xp=80, league="Silver League", is_user=False),
        LeaderboardUser(id=9, username="pedro_al", display_name="Pedro A.", avatar="tiger", xp=65, league="Silver League", is_user=False),
        LeaderboardUser(id=10, username="hanna_poly", display_name="Hanna T.", avatar="owl", xp=45, league="Silver League", is_user=False),
    ]
    db.add_all(leaderboard)
    db.commit()

    # 8. Seed Shop Items
    shop_items = [
        ShopItem(
            id="refill_hearts",
            title="Refill Hearts",
            description="Fully restore your hearts so you never have to pause your learning streak.",
            icon="heart",
            cost_gems=350,
            item_type="refill_hearts"
        ),
        ShopItem(
            id="streak_freeze",
            title="Streak Freeze",
            description="Allows your streak to remain intact even if you miss a full day of practice.",
            icon="snowflake",
            cost_gems=200,
            item_type="streak_freeze"
        ),
        ShopItem(
            id="double_or_nothing",
            title="Double or Nothing",
            description="Wager 50 gems and maintain a 7-day streak to double your gems to 100!",
            icon="gem",
            cost_gems=50,
            item_type="wager"
        ),
        ShopItem(
            id="duo_tuxedo",
            title="Duo Tuxedo Outfit",
            description="Dress your friendly owl companion in a dapper formal tuxedo for lessons.",
            icon="shirt",
            cost_gems=800,
            item_type="outfit"
        )
    ]
    db.add_all(shop_items)
    db.commit()

    print("Seeding complete! Spanish course, 2 units, 5 skills, exercises, quests, shop, and leaderboard initialized.")
