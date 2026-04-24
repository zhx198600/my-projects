import pygame


class InputController:
    def __init__(self):
        self.move_dx = 0
        self.move_dy = 0
        self.echo_pressed = False
        self.last_move_time = 0
        self.move_delay = 100
        
    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP or event.key == pygame.K_w:
                self.move_dy = -1
            elif event.key == pygame.K_DOWN or event.key == pygame.K_s:
                self.move_dy = 1
            elif event.key == pygame.K_LEFT or event.key == pygame.K_a:
                self.move_dx = -1
            elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                self.move_dx = 1
            elif event.key == pygame.K_SPACE:
                self.echo_pressed = True
        
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_UP or event.key == pygame.K_w:
                if self.move_dy == -1:
                    self.move_dy = 0
            elif event.key == pygame.K_DOWN or event.key == pygame.K_s:
                if self.move_dy == 1:
                    self.move_dy = 0
            elif event.key == pygame.K_LEFT or event.key == pygame.K_a:
                if self.move_dx == -1:
                    self.move_dx = 0
            elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                if self.move_dx == 1:
                    self.move_dx = 0

    def get_move_request(self, current_time):
        if self.move_dx == 0 and self.move_dy == 0:
            return None
        
        if current_time - self.last_move_time >= self.move_delay:
            dx = self.move_dx
            dy = self.move_dy
            
            if dx != 0 and dy != 0:
                dx = 0
            
            if dx != 0 or dy != 0:
                self.last_move_time = current_time
                return (dx, dy)
        
        return None

    def get_echo_request(self):
        if self.echo_pressed:
            self.echo_pressed = False
            return True
        return False

    def reset(self):
        self.move_dx = 0
        self.move_dy = 0
        self.echo_pressed = False
        self.last_move_time = 0

    def has_pending_input(self):
        return self.move_dx != 0 or self.move_dy != 0 or self.echo_pressed
