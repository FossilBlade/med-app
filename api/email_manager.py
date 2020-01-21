import  smtplib, ssl

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


from config import *



def __generate_and_send(receiver_email,subject,body):


    # Create a multipart message and set headers
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    # Add body to email
    message.attach(MIMEText(body, "plain"))
    text = message.as_string()

    # Log in to server using secure context and send email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, text)


def send_mail(receiver_email,dataset):

    subject = "Dataset:{} - Ready for viewing".format(dataset)
    body = "Dataset '{}' has been processed successfully.\nPlease visit https://showapp.vasognosis.com/view to view the generated data".format(dataset)

    __generate_and_send(receiver_email,subject,body)

def send_mail_error(receiver_email,dataset,error_msg):

    subject = "ERROR Dataset:{}".format(dataset)
    body = "Dataset '{}' failed processing.\nFailure Reason: ".format(error_msg)

    __generate_and_send(receiver_email, subject, body)