import tkinter as tk
from tkinter import messagebox
import speech_recognition as sr
import pyttsx3
import re

class VoiceCalculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Voice Calculator")
        self.expression = ""

        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()

        self.create_widgets()

    def speak(self, text):
        self.engine.say(text)
        self.engine.runAndWait()

    def listen(self):
        with sr.Microphone() as source:
            self.speak("Listening for your expression")
            self.recognizer.adjust_for_ambient_noise(source)
            audio = self.recognizer.listen(source)
            try:
                command = self.recognizer.recognize_google(audio)
                print(f"You said: {command}")
                return command
            except sr.UnknownValueError:
                self.speak("Sorry, I did not understand that.")
                return None
            except sr.RequestError as e:
                self.speak(f"Could not request results; {e}")
                return None

    def calculate(self, expression):
        expression = re.sub(r'[^0-9+\-*/().^ ]', '', expression)
        expression = expression.replace('^', '**')
        try:
            result = eval(expression)
            return result
        except Exception as e:
            return f"Error"

    def on_button_click(self, char):
        if char == '=':
            try:
                result = str(eval(self.expression))
                self.entry_var.set(result)
                self.expression = result
            except:
                self.entry_var.set("Error")
                self.expression = ""
        elif char == 'C':
            self.expression = ""
            self.entry_var.set("")
        else:
            self.expression += str(char)
            self.entry_var.set(self.expression)

    def voice_input(self):
        command = self.listen()
        if command:
            result = self.calculate(command)
            self.entry_var.set(str(result))
            self.speak(f"The result is {result}")

    def create_widgets(self):
        self.entry_var = tk.StringVar()
        entry = tk.Entry(self.root, textvariable=self.entry_var, font=('Arial', 24), bd=10, relief='ridge', justify='right')
        entry.grid(row=0, column=0, columnspan=4, ipadx=8, ipady=8)

        buttons = [
            ('C', 1, 0), ('+/-', 1, 1), ('%', 1, 2), ('/', 1, 3),
            ('7', 2, 0), ('8', 2, 1), ('9', 2, 2), ('*', 2, 3),
            ('4', 3, 0), ('5', 3, 1), ('6', 3, 2), ('-', 3, 3),
            ('1', 4, 0), ('2', 4, 1), ('3', 4, 2), ('+', 4, 3),
            ('0', 5, 0), ('.', 5, 1), ('=', 5, 2)
        ]

        for (text, row, col) in buttons:
            tk.Button(self.root, text=text, width=5, height=2, font=('Arial', 18),
                      command=lambda t=text: self.on_button_click(t)).grid(row=row, column=col, padx=5, pady=5)

        # Mic Button
        mic_btn = tk.Button(self.root, text='🎤', font=('Arial', 18), width=5, height=2, bg='orange', command=self.voice_input)
        mic_btn.grid(row=5, column=3, padx=5, pady=5)


if __name__ == "__main__":
    root = tk.Tk()
    app = VoiceCalculator(root)
    root.mainloop()

