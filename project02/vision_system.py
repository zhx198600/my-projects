from constants import ECHO_RANGE, ECHO_DURATION, ECHO_COOLDOWN


class VisionSystem:
    def __init__(self):
        self.player_x = 0
        self.player_y = 0
        self.echo_active = False
        self.echo_start_time = 0
        self.echo_cooldown = False
        self.cooldown_start_time = 0
        self.echo_range = ECHO_RANGE
        self.echo_duration = ECHO_DURATION
        self.cooldown_duration = ECHO_COOLDOWN
        self.visible_cells = set()
        self._update_visible_cells()

    def set_player_position(self, x, y):
        self.player_x = x
        self.player_y = y
        self._update_visible_cells()

    def update(self, current_time):
        if self.echo_active:
            if current_time - self.echo_start_time >= self.echo_duration:
                self.echo_active = False
                self.echo_cooldown = True
                self.cooldown_start_time = current_time
                self._update_visible_cells()

        if self.echo_cooldown:
            if current_time - self.cooldown_start_time >= self.cooldown_duration:
                self.echo_cooldown = False

    def trigger_echo(self, current_time):
        if self.echo_cooldown:
            return False

        self.echo_active = True
        self.echo_start_time = current_time
        self._update_visible_cells()
        return True

    def is_echo_active(self):
        return self.echo_active

    def is_on_cooldown(self):
        return self.echo_cooldown

    def get_echo_progress(self, current_time):
        if not self.echo_active:
            return 0.0
        elapsed = current_time - self.echo_start_time
        progress = elapsed / self.echo_duration
        return max(0.0, progress)

    def is_cell_visible(self, x, y):
        return (x, y) in self.visible_cells

    def get_visible_cells(self):
        return self.visible_cells.copy()

    def get_echo_visibility_range(self):
        return self.calculate_echo_cells(self.player_x, self.player_y, self.echo_range)

    def manhattan_distance(self, x1, y1, x2, y2):
        return abs(x1 - x2) + abs(y1 - y2)

    def calculate_echo_cells(self, center_x, center_y, range_limit):
        cells = set()
        for dx in range(-range_limit, range_limit + 1):
            for dy in range(-range_limit, range_limit + 1):
                if self.manhattan_distance(0, 0, dx, dy) <= range_limit:
                    cells.add((center_x + dx, center_y + dy))
        return cells

    def _update_visible_cells(self):
        if self.echo_active:
            self.visible_cells = self.get_echo_visibility_range()
        else:
            self.visible_cells = {(self.player_x, self.player_y)}
