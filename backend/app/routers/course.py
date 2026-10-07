from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Course, Unit, Skill, Lesson, UserSkillProgress, UserLessonProgress, User
from app.schemas import CourseOut, UnitOut, SkillOut, LessonBrief

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("", response_model=List[CourseOut])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    result = []
    for c in courses:
        result.append(CourseOut(
            id=c.id,
            title=c.title,
            description=c.description,
            flag_emoji=c.flag_emoji,
            total_xp=c.total_xp,
            units=[]
        ))
    return result

@router.get("/{course_id}/path", response_model=CourseOut)
def get_learning_path(course_id: str, user_id: int = 1, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch user skill progresses
    skill_progress_map = {}
    user_skill_progs = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user_id).all()
    for sp in user_skill_progs:
        skill_progress_map[sp.skill_id] = sp

    # Fetch user lesson completions
    lesson_progress_set = set()
    user_lesson_progs = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.completed == True
    ).all()
    for lp in user_lesson_progs:
        lesson_progress_set.add(lp.lesson_id)

    units_out = []
    all_skills_in_order = []

    # Sort units by order_index
    units = db.query(Unit).filter(Unit.course_id == course_id).order_by(Unit.order_index).all()
    for unit in units:
        skills = db.query(Skill).filter(Skill.unit_id == unit.id).order_by(Skill.order_index).all()
        skills_out = []

        for skill in skills:
            lessons = db.query(Lesson).filter(Lesson.skill_id == skill.id).order_by(Lesson.order_index).all()
            lessons_brief = [
                LessonBrief(
                    id=l.id,
                    skill_id=l.skill_id,
                    title=l.title,
                    xp_reward=l.xp_reward,
                    order_index=l.order_index,
                    completed=(l.id in lesson_progress_set)
                ) for l in lessons
            ]

            sp = skill_progress_map.get(skill.id)
            status = sp.status if sp else "locked"
            completed_lessons = sp.completed_lessons if sp else 0
            crown_level = sp.crown_level if sp else 0
            is_legendary = sp.is_legendary if sp else False

            skill_dto = SkillOut(
                id=skill.id,
                unit_id=skill.unit_id,
                title=skill.title,
                description=skill.description,
                icon=skill.icon,
                total_lessons=skill.total_lessons,
                order_index=skill.order_index,
                status=status,
                completed_lessons=completed_lessons,
                crown_level=crown_level,
                is_legendary=is_legendary,
                lessons=lessons_brief
            )
            skills_out.append(skill_dto)
            all_skills_in_order.append(skill_dto)

        units_out.append(UnitOut(
            id=unit.id,
            course_id=unit.course_id,
            unit_number=unit.unit_number,
            title=unit.title,
            description=unit.description,
            color=unit.color,
            order_index=unit.order_index,
            skills=skills_out
        ))

    # Auto-unlock first skill if all are locked
    if all_skills_in_order and all(s.status == "locked" for s in all_skills_in_order):
        all_skills_in_order[0].status = "available"

    return CourseOut(
        id=course.id,
        title=course.title,
        description=course.description,
        flag_emoji=course.flag_emoji,
        total_xp=course.total_xp,
        units=units_out
    )
