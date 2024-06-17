import random
from typing import List, Tuple


def generate_positions(width: int, height: int, seed: str) -> List[Tuple[int, int]] | None:
    """Function takes on a seed and generates a random board
    by first pairing columns and rows, and then flood-filing
    random islands round the points
    """
    random.seed(seed)

    for i in range(100):
        rows = list(range(1, height + 1))
        columns = list(range(1, width + 1))

        points = []
        count = min(len(rows), len(columns))

        blocked = {}
        def block_point(point):
            rows.remove(point[0])
            columns.remove(point[1])
            blocked[(point[0], -1)] = True
            blocked[(-1, point[1])] = True
            for ky in [-1, 1]:
                for kx in [-1, 1]:
                    blocked[(point[0] + ky, point[1] + kx)] = True

        random.shuffle(rows)
        random.shuffle(columns)
        for _ in range(count):
            for kx in rows:
                for ky in columns:
                    rpoint = (kx, -1)
                    cpoint = (-1, ky)

                    if rpoint in blocked or cpoint in blocked:
                        continue

                    npoint = (kx, ky)
                    if npoint in blocked:
                        continue

                    block_point(npoint)
                    points.append(npoint)
                    break
        
        if len(points) == count:
            break
    
    if len(points) != count:
        raise AssertionError(f"Couldn't generate {count} positions")

    return points


def generate_board(width: int, height: int, positions: List[Tuple[int, int]]) -> List[List[int]]:
    """Function takes in positions of island cores and generates random island seperation
    for the board
    """
    queue = {}
    board = [[-1 for _ in range(width)] for _ in range(height)]

    for idx, p in enumerate(positions):
        queue[idx] = []
        for d in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
            queue[idx].append(((p[0] - 1 + d[0], p[1] - 1 + d[1])))
        board[p[0] - 1][p[1] - 1] = idx

    canUpdate = True
    while canUpdate:
        canUpdate = False
        generatedAlready = False
        random_order = list(range(len(positions)))
        random.shuffle(random_order)

        for idx in random_order:
            while queue[idx]:
                newp = queue[idx].pop()

                if newp[0] >= len(board) or newp[1] >= len(board[0]) or newp[0] < 0 or newp[1] < 0:
                    continue
                if board[newp[0]][newp[1]] != -1:
                    continue

                if (not generatedAlready) and random.random() < 0.45:
                    continue

                canUpdate = True
                generatedAlready = True
                board[newp[0]][newp[1]] = idx
                for d in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
                    queue[idx].append((newp[0] + d[0], newp[1] + d[1]))
                break
    
    for x in range(width):
        for y in range(height):
            d = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            random.shuffle(d)
            if board[y][x] == -1:
                for dx, dy in d:
                    nx = x + dx
                    ny = y + dy
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    board[y][x] = board[ny][nx]
    
    # default colors for 8x8
    colors = ["#ffc992", "#ff7b60", "#b3dfa0", "#96beff", "#b9b29e", "#62efea", "#e6f388", "#bba3e2"]
    return [[colors[c] for c in col] for col in board]


def check_correctness(board: List[List[int]], pieces: List[Tuple[int, int]]) -> bool:
    """Function checks correctness of a solution for given board"""
    if len(board) < 0 or len(board) > 50:
        return False
    if len(pieces) != min(len(board), len(board[0])):
        return False

    colors_used = {}
    for i in range(len(pieces)):
        colors_used[board[pieces[0]][pieces[1]]] = True
        for j in range(i + 1, len(pieces)):
            if pieces[i][0] == pieces[j][0] or pieces[i][1] == pieces[j][1]:
                return False
            if abs(pieces[i][0] - pieces[j][0]) + abs(pieces[i][1] - pieces[j][1]) <= 2:
                return False

    return len(colors_used) == len(pieces)
