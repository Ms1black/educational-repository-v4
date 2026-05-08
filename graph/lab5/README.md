# Лабораторная работа №5 (вариант 3)

Реализованы пункты задания в отдельных файлах:

- `01_cube_textura.cpp` — Листинг 1: наложение 2D-текстуры из `.tga` на куб.
- `02_tetrahedron_1d.cpp` — Листинг 2: вращение объектов и одномерная текстура с плавной градацией (16 оттенков, что >= 12).
- `03_corridor.cpp` — Листинг 3: коридор по форме варианта (пятиугольник-стрелка), на каждой грани отдельная `.tga`.
- `04_torus_sphere_surface.cpp` — Листинг 4: тор/сфера/поверхность с текстурами и зеркальными бликами.

## Соответствие текстур для пункта 4

- Тор: `textures/sand.tga`
- Сфера: `textures/marble.tga`
- Поверхность: `textures/moon_landscape.tga`

Дополнительные объекты с произвольными текстурами из набора:
- кирпич: `textures/brick_wall.tga`
- асфальт: `textures/asphalt.tga`

Дополнительно в `textures` сгенерированы: `droplets_glass.tga`, `ornament.tga`, `watermelon.tga`, `stone_wall.tga`, `cracked_earth.tga`, `green_foliage.tga`.

## Файлы текстур

Все необходимые `.tga` находятся в `graph/lab5/textures`.
Загрузка сделана через `stb_image.h` (файл уже в `lab5`).

## Сборка

```bash
cd graph/lab5
make
```

## Запуск

```bash
./01_cube_textura
./02_tetrahedron_1d
./03_corridor
./04_torus_sphere_surface
```
