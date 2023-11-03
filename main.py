from kivy.config import Config
Config.set("graphics", "width", "360") # * 3
Config.set("graphics", "height", "780") # * 3

from kivymd.app import MDApp
from kivymd.uix.floatlayout import MDFloatLayout
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.scrollview import ScrollView
from kivymd.uix.label import MDLabel
from kivy.clock import Clock
from kivy.uix.widget import Widget


from time import time, localtime
import json

import socket
import threading


class InfoLayout(MDBoxLayout):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.orientation = 'vertical'
        self.size_hint = (1, None)

    def update_view(self, solves):
        self.clear_widgets()

        self.height = 21 * (len(solves) + 1) 

        self.padding = 10
        for solve in solves:
            l = MDBoxLayout()
            t = MDLabel()
            t_time = MDLabel()
            t.text = str(solve[0])
            time = localtime(solve[1])
            t_time.text = f"{time.tm_hour}:{time.tm_mday} / {time.tm_mon} / {time.tm_year}"

            t.font_size = 20
            t_time.font_size = 20
            l.add_widget(t)
            l.add_widget(t_time)
            self.add_widget(l)

class InfoView(MDBoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.layout = InfoLayout()
        self.scrollView = ScrollView()
        self.scrollView.size_hint = (1, 1.7)
        self.scrollView.add_widget(self.layout)
        self.scrollView.do_scroll_y = True
        self.scrollView.do_scroll_x = False

        self.best_text = MDLabel()
        self.avg_text = MDLabel()
        self.avg3_text = MDLabel()
        self.avg5_text = MDLabel()
        self.avg12_text = MDLabel()

        self.best_text.halign = 'center'
        self.best_text.theme_text_color = "Secondary"
        self.avg12_text.halign = 'center'
        self.avg12_text.theme_text_color = "Secondary"
        self.avg5_text.halign = 'center'
        self.avg5_text.theme_text_color = "Secondary"

        self.avg3_text.halign = 'center'
        self.avg3_text.theme_text_color = "Secondary"

        self.avg_text.halign = 'center'
        self.avg_text.theme_text_color = "Secondary"


        self.top_info = MDBoxLayout()
        self.top_info.add_widget(self.best_text)
        self.top_info.add_widget(self.avg_text)
        self.top_info.add_widget(self.avg3_text)
        self.top_info.add_widget(self.avg5_text)
        self.top_info.add_widget(self.avg12_text)
        self.top_info.orientation = 'vertical'
        self.top_info.size_hint = (1, 0.3)
        self.top_info.specific_text_color = (1, 0, 0, 1)

        self.add_widget(self.top_info)
        self.add_widget(self.scrollView)

        self.orientation = "vertical"


    def update_view(self, solves: list):
        solves_only = [x[0] for x in solves]
        try:
            best_solve = round(min(solves_only), 2)
            avg_solve = round(sum(solves_only)/len(solves_only), 2)
        except ValueError or ZeroDivisionError:
            best_solve = "-"
            avg_solve = "-"

        avg3, avg5, avg12 = "-", "-", "-"

        if len(solves_only) >= 3:
            avg3 = round(sum(solves_only[-3:])/3, 2)
        if len(solves_only)>= 5:
            avg5 = round(sum(solves_only[-5:])/5, 2)
        if len(solves_only)>= 12:
            avg12 = round(sum(solves_only[-12])/12, 2)
        
        self.best_text.text = "BEST SOLVE: " + str(best_solve)
        self.avg_text.text = "AVG: " + str(avg_solve)
        self.avg3_text.text = "MO3: " + str(avg3)
        self.avg5_text.text = "AO5: " + str(avg5)
        self.avg12_text.text = "AO12: " + str(avg12)

        print(self.avg_text, type(self.avg_text))
        self.layout.update_view(solves)

class Layout(MDFloatLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.size_hint = (1, 1)

        with open("solves.json", "r") as f:
            self.solves = json.load(f)

        self.label = MDLabel()
        self.label.text = "0"
        self.label.pos_hint = {'center_x': 0.5, "left": 0.5}
        self.label.halign = "center"
        self.label.bold = True
        self.label.font_size = 50
        self.label.theme_text_color = "Custom"
        self.label.text_color = (1, 1, 1, 1)

        self.state = "idle"
        self.buffer_start_time = None
        self.start_time = None

        self.infoScreen = InfoView()

        self.add_widget(self.label)
        self.add_widget(self.infoScreen)

        # Create and start the client thread
        self.client_thread = threading.Thread(target=self.client)
        self.client_thread.daemon = True
        self.client_thread.start()

        # Create and start the client thread
        self.client_thread = threading.Thread(target=self.client)
        self.client_thread.daemon = True
        self.client_thread.start()

    def on_touch_down(self, touch):

        if self.state == "start":
            self.stop()

        else:
            if touch.button == 'right':
                if self.state == 'info':
                    self.state = "idle"
                elif self.state == 'idle':
                    self.infoScreen.update_view(self.solves)
                    self.state = 'info'

            else:
                if self.state == "idle":
                    self.label.text = "0"
                    self.label.text_color = (1, 0, 0, 1) 
                    self.buffer_start_time = time()

        return super().on_touch_down(touch)
    
    def client(self):
        host = 'DESKTOP-0DRIHG3' # get local machine name
        port = 8080  # Make sure it's within the > 1024 && < 65535 range
        
        self.client_socket = socket.socket()
        self.client_socket.connect((host, port))
        
        message = 'Hello, Server'
        self.client_socket.send(message.encode('utf-8'))
        data = self.client_socket.recv(1024).decode('utf-8')
        print('recieved data: ' + data)

    def on_touch_up(self, touch):
        if self.state == "start":
            self.start_time = time()
        else:
            self.buffer_start_time = None

        self.label.text_color = (1, 1, 1, 1)
        return super().on_touch_up(touch)
    
    def start_state(self):
        self.state = "start"
        self.label.text = "0"
        self.label.text_color = (0, 1, 0, 1)

    def stop(self):
        self.state = "idle"
        time_ = round(time() - self.start_time, 2)
        self.label.text = str(time_)
        self.solves.append((time_, time()))
        self.start_time = None

        with open("solves.json", "w") as file:
            json.dump(self.solves, file)
    
    def update(self):

        if self.state == "info":
            self.label.opacity = 0
            self.infoScreen.opacity = 1

        else:
            self.infoScreen.opacity = 0
            self.label.opacity = 1

        if self.buffer_start_time:
            if time() - self.buffer_start_time > 1:
                self.start_state()
                self.buffer_start_time = None

        if self.start_time:
            self.label.text = str(round(time() - self.start_time, 1))

class TimerApp(MDApp):
    
    def build(self):
        self.theme_cls.theme_style = "Dark"

        Clock.schedule_interval(self.update, 0.01)

        self.layout = Layout()
        return self.layout

    def update(self, dt):
        self.layout.update()

TimerApp().run()
